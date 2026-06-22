# Tubulu PSTN Voice-AI Shopping Gateway
## End-to-End Implementation Plan (Vedanth Pattern)

> **Core Principle**: This is identical to Vedanth's architecture. Vedanth answers calls and books appointments. Tubulu answers calls and completes grocery/product orders.

---

## 🏗️ Full Architecture

```
Customer dials store DID
        ↓
Asterisk PBX (AudioSocket / ARI)
        ↓ slin16 binary stream
WEBRTC_OBD_PRADEEP/server.js (Node.js Gateway — Port 8080)
        ↓ WAV bytes
[Sarvam STT] saarika-v2 → transcript text
        ↓ text
[Gemini Flash] Intent: product_search | add_to_cart | checkout | help
        ↓ calls
[Tubulu REST APIs] /products/search, /cart/add, /orders/checkout
        ↓ response text
[Sarvam TTS] bulbul:v2 → WAV base64
        ↓ convert WAV → slin16
Asterisk plays audio to Customer
```

---

## 📋 Implementation Steps (7 Phases)

---

### ✅ PHASE 1 — Database Schema Update (Tubulu Backend)

**Goal**: Each store (Integration) needs its own phone number (DID) stored in PostgreSQL.

**File to Edit**: `backend/Models/Integration.pg.js`

**Add column**:
```javascript
pstnDID: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'PSTN DID number mapped to this store for voice-AI calls'
},
sarvamApiKey: {
  type: DataTypes.STRING,
  allowNull: true,
  comment: 'Per-store Sarvam AI API key override (falls back to global key)'
}
```

**Migration SQL**:
```sql
ALTER TABLE "Integrations" ADD COLUMN "pstnDID" VARCHAR(20);
ALTER TABLE "Integrations" ADD COLUMN "sarvamApiKey" VARCHAR(255);
```

**New Admin REST Endpoints** (add to `Integration.Route.js`):
```
PATCH /api/v1/integrations/pstn/configure  → Save DID + Sarvam key per store
GET  /api/v1/integrations/pstn/lookup/:did → Map incoming DID → storeId
```

---

### ✅ PHASE 2 — Admin Portal: Sarvam API Key Management

**Goal**: Super Admin + Merchant Admin can update the Sarvam key from the dashboard UI.

**Pattern from Vedanth**: `MasterKey` Mongoose schema storing `sarvam` key, updatable via `/api/master-keys`.

**Tubulu Version** (in PostgreSQL `Integrations` table):
- Add a **"PSTN Settings" tab** to the merchant dashboard.
- Field: `Sarvam API Key` (masked input, shows last 6 chars).
- Field: `Store DID Number` (phone number input).
- Save via `PATCH /api/v1/integrations/merchant/update` (already exists!).

**Global fallback key** (Super Admin only):
```
PATCH /api/v1/admin/pstn-config  → { sarvamApiKey: "...", defaultLanguage: "en-IN" }
```

---

### ✅ PHASE 3 — WEBRTC_OBD_PRADEEP: Sarvam STT Integration

**Goal**: Convert raw SLIN16 binary audio from Asterisk → text transcript.

**Sarvam API**: `POST https://api.sarvam.ai/speech-to-text`

**Key Implementation Details** (same as Vedanth):
1. Asterisk sends SLIN16 audio (16kHz, 16-bit, mono).
2. We **buffer ~3-5 seconds** of chunks into a WAV file in memory.
3. Send the WAV to Sarvam STT as `multipart/form-data`.
4. Receive transcript text → pass to Gemini Flash.

```javascript
const FormData = require('form-data');
const { WaveFile } = require('wavefile');

async function transcribeWithSarvam(slin16Buffer, sarvamKey) {
    // Convert raw SLIN16 to WAV
    const wav = new WaveFile();
    wav.fromScratch(1, 16000, '16', Array.from(new Int16Array(slin16Buffer.buffer)));
    const wavBuffer = Buffer.from(wav.toBuffer());

    const form = new FormData();
    form.append('file', wavBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
    form.append('language_code', 'en-IN');
    form.append('model', 'saarika:v2');

    const response = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
        headers: { ...form.getHeaders(), 'api-subscription-key': sarvamKey }
    });
    return response.data.transcript;
}
```

---

### ✅ PHASE 4 — Gemini Flash: Intent Router (Shopping Brain)

**Goal**: Gemini Flash receives transcript + store context → decides action.

**Pattern from Vedanth**: `sarvam-m` LLM with structured system prompt. We swap in **Gemini Flash** as requested.

**System Prompt Template**:
```
You are the Tubulu Voice Shopping Assistant for {storeName}.
Primary language: English (en-IN).
Available catalogue: {catalogueContext}

Your job:
1. Help the customer find products — search by name, brand, or category.
2. Add items to their cart — confirm name, quantity, and price.
3. When customer confirms, place the order and tell them a payment SMS is coming.

Rules:
- Be concise (phone call — max 2 sentences per reply).
- Always confirm price before adding to cart.
- If item not found, suggest alternatives from the catalogue.
- Extract: INTENT (search|add_cart|checkout|cancel|help), PRODUCT_NAME, QUANTITY.

Current cart: {cartSummary}
Current time: {currentTime}
```

**Intent Extraction** (same 2-step LLM pattern as Vedanth's booking extractor):
```javascript
// Step 1: Main conversational reply
const mainReply = await gemini.generateContent(systemPrompt + transcript);

// Step 2: JSON extractor (only when cart action detected)
if (isCartAction) {
    const extraction = await gemini.generateContent(EXTRACTOR_PROMPT + mainReply);
    // Returns: { intent: "add_cart", productId: "...", quantity: 2 }
}
```

---

### ✅ PHASE 5 — Sarvam TTS: Voice Response Back to Asterisk

**Goal**: Convert Gemini's text reply → WAV audio → SLIN16 → play to customer.

**Sarvam API**: `POST https://api.sarvam.ai/text-to-speech`

```javascript
async function speakWithSarvam(text, sarvamKey) {
    const response = await axios.post('https://api.sarvam.ai/text-to-speech', {
        inputs: [text],
        target_language_code: 'en-IN',
        speaker: 'anushka',   // English female voice
        model: 'bulbul:v2',
        enable_preprocessing: true
    }, {
        headers: { 'api-subscription-key': sarvamKey }
    });

    // Sarvam returns base64 WAV
    const wavBuffer = Buffer.from(response.data.audios[0], 'base64');
    
    // Convert WAV → SLIN16 for Asterisk
    const wav = new WaveFile(wavBuffer);
    wav.toSampleRate(8000); // Asterisk standard rate
    return Buffer.from(wav.data.samples);
}
```

---

### ✅ PHASE 6 — Asterisk ARI: Wiring the Call Pipeline

**Goal**: Connect Asterisk to our Node.js WebSocket gateway.

**Asterisk Config** (`extensions.conf`):
```
[tubulu-inbound]
exten => _XXXXXXXXXX,1,Answer()
exten => _XXXXXXXXXX,n,AudioSocket(127.0.0.1:8080,${EXTEN})
exten => _XXXXXXXXXX,n,Hangup()
```

**How DID Mapping Works**:
- Asterisk passes the dialed number (DID) in the `EXTEN` variable.
- The Node.js gateway receives it in the initial metadata from AudioSocket.
- Gateway calls: `GET /api/v1/integrations/pstn/lookup/:did` → gets `storeId`, `catalogueId`, `sarvamApiKey`.

---

### ✅ PHASE 7 — Local Simulation & Testing

**Run order**:
```bash
# Terminal 1: Start Tubulu Backend
cd backend && npm run dev

# Terminal 2: Start PSTN Gateway
cd WEBRTC_OBD_PRADEEP && node server.js

# Terminal 3: Run shopping simulation
cd WEBRTC_OBD_PRADEEP && node simulate_pstn_shopping.js
```

**Expected simulation output**:
```
📡 [Call Connected]
👤 Customer: "Do you have organic milk?"
🤖 AI: "Yes! Amul Organic Milk 1L is ₹85. How many would you like?"
👤 Customer: "Add 2 bottles please."
🤖 AI: "Added 2x Amul Organic Milk to your cart. Total is ₹170. Shall I checkout?"
👤 Customer: "Yes, go ahead."
🤖 AI: "Order placed! A payment link has been sent to your phone. Thank you!"
📞 [Call Ended]
```

---

## 📦 New Dependencies Needed

```bash
cd WEBRTC_OBD_PRADEEP
npm install wavefile form-data @google/generative-ai axios
```

---

## 🔑 `.env` File Updates

```env
PORT=8080
USE_WSS=false

# Sarvam AI (Global Fallback)
SARVAM_API_KEY=your_sarvam_key_here

# Gemini Flash
GOOGLE_API_KEY=your_gemini_key_here
GEMINI_MODEL=gemini-1.5-flash

# Tubulu Backend
BACKEND_URL=http://localhost:3008/api/v1
BACKEND_ADMIN_TOKEN=admin_jwt_token_here

# Asterisk ARI
ARI_URL=http://localhost:8088
ARI_USERNAME=asterisk
ARI_PASSWORD=asterisk
STASIS_APP=tubulu-voice-shop
```

---

## 📅 Build Timeline

| Phase | Task | Effort |
|:--|:--|:--|
| 1 | DB schema + migration + REST endpoints | 2 hrs |
| 2 | Admin portal Sarvam key UI | 3 hrs |
| 3 | Sarvam STT wiring in server.js | 2 hrs |
| 4 | Gemini Flash intent router + extractor | 3 hrs |
| 5 | Sarvam TTS + WAV→SLIN16 conversion | 2 hrs |
| 6 | Asterisk ARI config + DID mapping | 2 hrs |
| 7 | Simulation testing + bug fixes | 2 hrs |
| **Total** | | **~16 hrs** |

---

> **Ready to start?** — Say which Phase to implement first and we'll build it live.
