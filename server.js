require('dotenv').config();
const express   = require('express');
const http      = require('http');
const WebSocket = require('ws');
const axios     = require('axios');
const FormData  = require('form-data');
const { WaveFile } = require('wavefile');

const app  = express();
app.use(express.json());

const PORT           = process.env.PORT        || 8080;
const SARVAM_KEY     = process.env.SARVAM_API_KEY || '';
const BACKEND_URL    = process.env.BACKEND_URL || 'http://localhost:3008/api/v1';
const FALLBACK_DID   = '07127191144'; // Anand Bakery Indiranagar

// Asterisk SLIN16: 16-bit signed PCM, 16 kHz, mono, 640 bytes = 20 ms per frame
const SAMPLE_RATE  = 16000;
const FRAME_SIZE   = 640;   // bytes per 20 ms frame
const FRAME_MS     = 20;    // ms per frame

const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', port: PORT }));

// ─── Helper: Store lookup ─────────────────────────────────────────────────────
async function lookupStore(did) {
    try {
        const r = await axios.get(`${BACKEND_URL}/integrations/pstn/lookup/${did}`, { timeout: 5000 });
        if (r.data?.success) return r.data.data;
    } catch (e) { console.warn(`[Store] Lookup failed: ${e.message}`); }
    return null;
}

async function fetchCatalogue(storeId) {
    try {
        const r = await axios.get(`${BACKEND_URL}/integrations/pstn/products/${storeId}`, { timeout: 5000 });
        if (r.data?.data?.length > 0)
            return r.data.data.map(p => `${p.productName}: ₹${p.price}`).join(', ');
    } catch (_) {}
    return 'Amul Milk 1L: ₹85, Bread 400g: ₹60, Red Label Tea 500g: ₹210';
}

// ─── Helper: TTS via Sarvam REST → raw SLIN16 Buffer ─────────────────────────
// Returns a Buffer of raw 16-bit signed PCM at 16 kHz ready for Asterisk.
async function ttsToSlin16(text, lang, sarvamKey) {
    const speaker = lang === 'kn-IN' ? 'manisha' : lang === 'hi-IN' ? 'vidya' : 'anushka';
    const res = await axios.post('https://api.sarvam.ai/text-to-speech', {
        inputs              : [text],
        target_language_code: lang,
        speaker,
        model               : 'bulbul:v2',
        enable_preprocessing: true
    }, {
        headers: { 'api-subscription-key': sarvamKey },
        timeout: 15000
    });
    if (!res.data?.audios?.[0]) throw new Error('No audio returned from Sarvam TTS');

    // Sarvam returns WAV at 22050 Hz → resample to 16 kHz → raw PCM bytes
    const wavBuf = Buffer.from(res.data.audios[0], 'base64');
    const wav    = new WaveFile(wavBuf);
    wav.toSampleRate(SAMPLE_RATE);
    const pcm = Buffer.from(wav.data.samples);
    console.log(`[TTS] ${(pcm.length / (SAMPLE_RATE * 2)).toFixed(2)}s of SLIN16 generated (${pcm.length} bytes)`);
    return pcm;
}

// ─── Helper: Stream SLIN16 PCM to Asterisk at 20 ms/frame ────────────────────
// Self-correcting timer keeps jitter minimal.
function streamToAsterisk(ws, pcmBuffer) {
    return new Promise((resolve) => {
        if (!pcmBuffer || ws.readyState !== WebSocket.OPEN) return resolve();
        let offset = 0, frame = 0;
        const start = Date.now();
        console.log(`[TX] Streaming ${Math.ceil(pcmBuffer.length / FRAME_SIZE)} frames → Asterisk`);

        function send() {
            if (ws.readyState !== WebSocket.OPEN || offset >= pcmBuffer.length) {
                console.log(`[TX] Done — ${frame} frames sent`);
                return resolve();
            }
            ws.send(pcmBuffer.slice(offset, offset + FRAME_SIZE));
            offset += FRAME_SIZE;
            frame++;
            const next = start + frame * FRAME_MS - Date.now();
            setTimeout(send, Math.max(0, next));
        }
        send();
    });
}

// ─── Helper: STT via Sarvam REST ─────────────────────────────────────────────
// Takes a Buffer of raw SLIN16 PCM, wraps it in a WAV header, sends to Sarvam.
async function sttFromSlin16(pcmBuffer, sarvamKey) {
    const wav = new WaveFile();
    const samples = [];
    for (let i = 0; i + 1 < pcmBuffer.length; i += 2)
        samples.push(pcmBuffer.readInt16LE(i));
    wav.fromScratch(1, SAMPLE_RATE, '16', samples);

    const form = new FormData();
    form.append('file', Buffer.from(wav.toBuffer()), { filename: 'voice.wav', contentType: 'audio/wav' });
    form.append('language_code', 'en-IN');
    form.append('model', 'saarika:v2.5');

    const res = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
        headers: { ...form.getHeaders(), 'api-subscription-key': sarvamKey },
        timeout: 10000
    });
    return (res.data.transcript || '').trim();
}

// ─── Helper: VAD — RMS energy of a SLIN16 frame ──────────────────────────────
function frameEnergy(buf) {
    let sum = 0;
    for (let i = 0; i + 1 < buf.length; i += 2)
        sum += Math.abs(buf.readInt16LE(i));
    return buf.length > 1 ? sum / (buf.length / 2) : 0;
}

// ─── Helper: SMS on checkout ──────────────────────────────────────────────────
async function sendCheckoutSMS(phone, link) {
    try {
        let d = phone.toString().replace(/\D/g, '');
        if (d.length === 10) d = '91' + d;
        await axios.get('https://transapi.pinnacle.in/genericapi/QSGenericReceiver', {
            params: {
                version: '1.0', accesskey: 'Tpc7foPVPe6N', dest: d,
                header: 'PINCLE',
                msg: `Your Tubulu order is placed! Pay: ${link} -PinnacleTeleservices`,
                dlt_entity_id: '1501664220000010227',
                dlt_template_id: '1507165330162088537', type: 'PM'
            }
        });
        console.log(`[SMS] Sent to ${d}`);
    } catch (e) { console.error('[SMS] Failed:', e.message); }
}

// ─── WebSocket handler ────────────────────────────────────────────────────────
wss.on('connection', async (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`\n📞 [Call Connected] ${ip}`);

    // Resolve DID + caller from URL / headers
    let did = FALLBACK_DID, callerPhone = '9999999999';
    try {
        const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        did         = u.searchParams.get('did') || u.searchParams.get('to') || FALLBACK_DID;
        callerPhone = u.searchParams.get('callerPhone') || u.searchParams.get('from') || '9999999999';
    } catch (_) {}
    did         = req.headers['x-did']          || did;
    callerPhone = req.headers['x-caller-phone'] || callerPhone;
    console.log(`📡 DID:${did}  Caller:${callerPhone}`);

    // Store lookup (awaited — we need storeName before greeting)
    let storeName  = 'Tubulu Store';
    let storeId    = null;
    let sarvamKey  = SARVAM_KEY;
    let geminiKey  = null;
    let voiceProvider = 'sarvam';
    let catalogue  = '';

    const store = await lookupStore(did);
    if (store) {
        storeName = store.storeName  || storeName;
        storeId   = store.storeId   || null;
        if (store.sarvamApiKey) sarvamKey = store.sarvamApiKey;
        if (store.geminiApiKey) geminiKey = store.geminiApiKey;
        if (store.voiceProvider) voiceProvider = store.voiceProvider;
        console.log(`✅ [Store] "${storeName}" (${storeId})`);
    }
    if (storeId) catalogue = await fetchCatalogue(storeId);

    // Session
    let lang        = 'en-IN';
    let aiSpeaking  = false;
    let callerNum   = callerPhone;

    // VAD buffers
    let speechChunks   = [];
    let silenceTimer   = null;
    const ENERGY_THOLD = 300;   // SLIN16 amplitude threshold
    const SILENCE_MS   = 1200;  // trigger STT after 1.2 s of quiet

    // Conversation history
    const systemPrompt = `You are a friendly voice shopping AI for "${storeName}". Keep replies under 2 short sentences — this is a phone call.
Available products: [ ${catalogue || 'ask the customer what they need'} ]
Rules: help find products, confirm price before adding to cart, and on checkout say a payment SMS is coming.`;
    let history = [{ role: 'system', content: systemPrompt }];

    // ── Respond to a customer transcript ────────────────────────────────────
    async function respond(transcript) {
        if (aiSpeaking) return;
        aiSpeaking = true;
        history.push({ role: 'user', content: transcript });

        // Language detection
        const lower = transcript.toLowerCase();
        if (/kannada/.test(lower)) lang = 'kn-IN';
        else if (/hindi/.test(lower)) lang = 'hi-IN';

        // LLM
        let reply = "I'm here to help you shop. What would you like?";
        try {
            if (voiceProvider === 'gemini') {
                const { GoogleGenerativeAI } = require("@google/generative-ai");
                const apiKey = geminiKey || process.env.GOOGLE_API_KEY;
                if (!apiKey) throw new Error("Gemini API key not configured");
                
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: { temperature: 0.1 }
                });
                
                const geminiHistory = history.slice(0, -1).map(item => ({
                    role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
                    parts: [{ text: item.content || '' }]
                }));
                const chat = model.startChat({
                    history: geminiHistory
                });
                const result = await chat.sendMessage(transcript);
                reply = result.response.text().trim();
            } else {
                const r = await axios.post('https://api.sarvam.ai/v1/chat/completions', {
                    model               : 'sarvam-30b',
                    messages            : history,
                    temperature         : 0.1,
                    max_completion_tokens: 200
                }, { headers: { 'api-subscription-key': sarvamKey }, timeout: 20000 });

                let raw = r.data?.choices?.[0]?.message?.content || reply;
                raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                reply = raw || reply;
            }
        } catch (e) { console.error('[LLM]', e.message); }

        console.log(`🤖 AI: "${reply}"`);
        history.push({ role: 'assistant', content: reply });

        // Checkout → SMS
        if (/checkout|pay|confirm|place order/i.test(lower)) {
            const id = 'ord_' + Math.random().toString(36).slice(2, 10).toUpperCase();
            sendCheckoutSMS(callerNum, `https://tubulu.in/receipt/${id}`);
        }

        // TTS → Asterisk
        try {
            const pcm = await ttsToSlin16(reply, lang, sarvamKey);
            await streamToAsterisk(ws, pcm);
        } catch (e) { console.error('[TTS→TX]', e.message); }

        aiSpeaking = false;

        if (/checkout|pay|confirm/i.test(lower))
            setTimeout(() => { if (ws.readyState === WebSocket.OPEN) ws.close(); }, 4000);
    }

    // ── Play greeting ────────────────────────────────────────────────────────
    (async () => {
        const greet = `Welcome to ${storeName}! I'm your AI shopping assistant. What would you like to order today?`;
        history.push({ role: 'assistant', content: greet });
        console.log(`🤖 [Greeting] "${greet}"`);
        try {
            aiSpeaking = true;
            const pcm = await ttsToSlin16(greet, lang, sarvamKey);
            await streamToAsterisk(ws, pcm);
            aiSpeaking = false;
        } catch (e) {
            console.error('[Greeting TTS]', e.message);
            aiSpeaking = false;
        }
    })();

    // ── Incoming messages from Asterisk ─────────────────────────────────────
    ws.on('message', (message, isBinary) => {
        // JSON control messages (ari_cli start event, simulator text)
        if (!isBinary) {
            try {
                const data = JSON.parse(message.toString());
                if (data.event === 'start') {
                    callerNum = data.callerIdNumber || data.callerPhone || callerPhone;
                    console.log(`📋 [Start] caller=${callerNum} channel=${data.channelId || ''}`);
                }
            } catch (_) {
                // Plain text from test simulator
                const text = message.toString().trim();
                if (text) respond(text);
            }
            return;
        }

        // Raw SLIN16 binary audio from Asterisk
        if (aiSpeaking) return; // mute mic while AI is speaking

        const energy = frameEnergy(message);
        if (energy > ENERGY_THOLD) {
            speechChunks.push(Buffer.from(message));
            clearTimeout(silenceTimer);
            silenceTimer = setTimeout(async () => {
                if (speechChunks.length === 0) return;
                const audio = Buffer.concat(speechChunks);
                speechChunks = [];
                console.log(`[VAD] ${audio.length} bytes → STT`);
                aiSpeaking = true;
                try {
                    const transcript = await sttFromSlin16(audio, sarvamKey);
                    if (transcript.length > 1) {
                        console.log(`👤 Customer: "${transcript}"`);
                        await respond(transcript);
                    }
                } catch (e) { console.error('[STT]', e.message); }
                aiSpeaking = false;
            }, SILENCE_MS);
        }
    });

    ws.on('close', () => {
        clearTimeout(silenceTimer);
        console.log('🔌 [Call Ended]');
    });

    ws.on('error', (e) => console.error('❌ [WS Error]', e.message));
});

// ─── Start ────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
    console.log(`\n${'='.repeat(56)}`);
    console.log(`⚡   TUBULU VOICE-AI PSTN GATEWAY   ⚡`);
    console.log(`${'='.repeat(56)}`);
    console.log(`WebSocket  : ws://0.0.0.0:${PORT}`);
    console.log(`Codec      : SLIN16  16 kHz  640 bytes/frame  20 ms`);
    console.log(`STT        : Sarvam saarika:v2.5  (REST)`);
    console.log(`TTS        : Sarvam bulbul:v2     (REST → PCM → streamed)`);
    console.log(`LLM        : sarvam-30b            (REST)`);
    console.log(`Backend    : ${BACKEND_URL}`);
    console.log(`Sarvam Key : ${SARVAM_KEY ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`${'='.repeat(56)}\n`);
});
