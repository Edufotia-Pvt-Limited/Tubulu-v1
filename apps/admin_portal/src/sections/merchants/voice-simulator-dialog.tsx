import { useState, useEffect, useRef } from 'react';
// @mui
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
// components
import Iconify from 'src/components/iconify';
// types
import { IMerchantItem } from 'src/types/merchant';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  merchant: IMerchantItem;
};

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  text: string;
  time: string;
};

export default function VoiceSimulatorDialog({ open, onClose, merchant }: Props) {
  const [gatewayUrl, setGatewayUrl] = useState('http://localhost:8080');
  const [callerPhone, setCallerPhone] = useState('9844982389');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [smsLink, setSmsLink] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const isConnectedRef = useRef(false);

  // Initialize or Clean resources on close
  useEffect(() => {
    if (!open) {
      disconnectSession();
    }
    return () => {
      disconnectSession();
    };
  }, [open]);

  // Connect & Start Session (Vedanth style HTML5 SpeechRecognition + REST neural-turn)
  const connectSession = async () => {
    try {
      isConnectedRef.current = true;
      setIsConnected(true);
      setSmsLink(null);
      historyRef.current = [];

      setChatLog([
        {
          role: 'system',
          text: `📡 Connecting to Voice-AI Gateway REST interface...`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);

      // Initialize AudioContext
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const welcomeText = "Welcome to Tubulu Voice-AI Shopper. How can I help you complete your shopping today?";
      
      setChatLog((prev) => [
        ...prev,
        {
          role: 'system',
          text: `✅ Connected! Dialing: ${merchant.integrationName} (DID: ${(merchant as any).pstnDID || '9999999999'})`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        {
          role: 'assistant',
          text: welcomeText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      historyRef.current.push({ role: 'assistant', content: welcomeText });

      // Request and play welcome voice audio
      try {
        const response = await fetch(`${gatewayUrl}/api/voice/neural-turn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: "hello",
            storeId: merchant.id,
            callerPhone: callerPhone,
            history: []
          })
        });
        const data = await response.json();
        if (data.audioBase64) {
          await playBase64Audio(data.audioBase64);
        }
      } catch (err) {
        console.error("Welcome synthesis failed, using text fallback:", err);
      }

      // Start browser SpeechRecognition
      startSpeechRecognition();

    } catch (err: any) {
      console.error(err);
      disconnectSession();
    }
  };

  // Disconnect & Terminate Stream
  const disconnectSession = () => {
    isConnectedRef.current = false;
    setIsConnected(false);
    setIsSpeaking(false);
    setIsAiSpeaking(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {}
      activeSourceRef.current = null;
    }

    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }

    historyRef.current = [];
  };

  // Start Speech Recognition
  const startSpeechRecognition = () => {
    try {
      if (!isConnectedRef.current) return;
      if (recognitionRef.current) return; // Prevent duplicate instantiation!

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition is not supported in this browser.");
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; // Multilingual Indian English
      recognition.continuous = true;
      recognition.interimResults = true;

      let silenceTimer: any = null;
      let accumulatedText = "";

      recognition.onstart = () => {
        setIsSpeaking(false);
        setChatLog((prev) => [
          ...prev,
          {
            role: 'system',
            text: `🎙️ Microphone connected! Speak now...`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Append final transcript to accumulator FIRST (prevents double-send in closure)
        if (finalTranscript) {
          accumulatedText = (accumulatedText + " " + finalTranscript).trim();
        }

        if ((accumulatedText + interimTranscript).trim().length > 0) {
          setIsSpeaking(true);
        }

        if (silenceTimer) clearTimeout(silenceTimer);

        // Capture snapshot of accumulated text for this silence window
        const snapshotText = accumulatedText;
        silenceTimer = setTimeout(async () => {
          const finalText = snapshotText.trim();
          if (finalText.length > 1) {
            setIsSpeaking(false);
            accumulatedText = ""; // Reset for next utterance
            try {
              recognition.stop();
            } catch {}
            await handleUserSpeakTurn(finalText);
          }
        }, 1500);
      };

      recognition.onend = () => {
        setIsSpeaking(false);
        recognitionRef.current = null; // Clear active reference on end
        // Auto restart if still connected and not speaking/playing
        setTimeout(() => {
          if (isConnectedRef.current && !isAiSpeaking && !recognitionRef.current) {
            startSpeechRecognition();
          }
        }, 300);
      };

      recognition.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e.error);
        if (e.error === 'no-speech' && isConnectedRef.current) {
          try {
            recognition.stop();
          } catch {}
          return;
        }

        setChatLog((prev) => [
          ...prev,
          {
            role: 'system',
            text: `⚠️ Mic issue: ${e.error === 'not-allowed' ? 'Access Blocked! Please click the camera/mic icon in the browser address bar to allow microphone access.' : e.error}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (err: any) {
      console.error(err);
      setChatLog((prev) => [
        ...prev,
        {
          role: 'system',
          text: `❌ Mic Error: ${err.message || 'Speech Recognition unsupported in this browser.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Process User Speech turn with REST endpoint
  const handleUserSpeakTurn = async (text: string) => {
    if (!isConnectedRef.current) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog((prev) => [...prev, { role: 'user', text, time: userTime }]);

    const currentHistory = [...historyRef.current];
    currentHistory.push({ role: 'user', content: text });
    historyRef.current = currentHistory;

    // Stop recognition reference during rest call
    recognitionRef.current = null;
    let shouldDisconnect = false;

    try {
      const response = await fetch(`${gatewayUrl}/api/voice/neural-turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: text,
          storeId: merchant.id,
          callerPhone: callerPhone,
          history: currentHistory.slice(0, -1)
        })
      });

      if (!response.ok) throw new Error(`Gateway returned HTTP ${response.status}`);

      const data = await response.json();

      if (data.success) {
        const aiReply = data.aiReply;
        const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setChatLog((prev) => [...prev, { role: 'assistant', text: aiReply, time: aiTime }]);
        historyRef.current.push({ role: 'assistant', content: aiReply });

        if (data.smsDispatched || data.checkoutLink) {
          shouldDisconnect = true;
          setSmsLink(data.checkoutLink || `https://tubulu.in/receipt/ord_TEST`);
          setChatLog((prev) => [
            ...prev,
            {
              role: 'system',
              text: `📲 Checkout SMS Dispatched to ${callerPhone}!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            }
          ]);
        }

        if (data.audioBase64) {
          await playBase64Audio(data.audioBase64);
        }
      }
    } catch (err: any) {
      console.error(err);
      setChatLog((prev) => [
        ...prev,
        {
          role: 'system',
          text: `❌ Gateway Error: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      if (shouldDisconnect) {
        setChatLog((prev) => [
          ...prev,
          {
            role: 'system',
            text: `🔌 [Call Terminated] Checkout complete. Hanging up...`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
        setTimeout(() => {
          disconnectSession();
        }, 1500);
      } else {
        // Restart speech recognition loop
        if (isConnectedRef.current) {
          startSpeechRecognition();
        }
      }
    }
  };

  // Decode & Play Base64 WAV audio back using Web Audio API
  const playBase64Audio = async (base64Data: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      
      // Auto-resume audio context to satisfy browser autoplay security policy
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const audioData = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      activeSourceRef.current = source;
      setIsAiSpeaking(true);

      await new Promise<void>((resolve) => {
        source.onended = () => {
          setIsAiSpeaking(false);
          activeSourceRef.current = null;
          resolve();
        };
        source.start(0);
      });
    } catch (err: any) {
      console.error("Audio playback error:", err);
      setIsAiSpeaking(false);
      activeSourceRef.current = null;
      setChatLog((prev) => [
        ...prev,
        {
          role: 'system',
          text: `⚠️ Playback error: ${err.message || 'The audio format could not be decoded. Check your browser volume or audio formats.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:microphone-bold-duotone" color="primary.main" width={28} />
          <Typography variant="h6">PSTN Voice Simulator</Typography>
        </Stack>
        <IconButton onClick={onClose}>
          <Iconify icon="eva:close-fill" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Connection Parameters */}
          {!isConnected ? (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Voice-AI Gateway REST URL"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                variant="outlined"
                helperText="Enter the local HTTP server or secure tunnel URL (e.g. http://localhost:8080)"
              />
              <TextField
                fullWidth
                label="Simulated Caller Phone Number"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                variant="outlined"
                helperText="Enter the customer mobile where checkout SMS is dispatched"
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                color="primary"
                startIcon={<Iconify icon="solar:phone-calling-bold" />}
                onClick={connectSession}
              >
                Start Voice Call Simulation
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3}>
              {/* Dynamic Call Indicator */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                  border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.16)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <Iconify icon="solar:phone-calling-bold" />
                    </Avatar>
                    {(isSpeaking || isAiSpeaking) && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -4,
                          left: -4,
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSpeaking ? 'primary.main' : 'success.main',
                          animation: 'pulse 1.2s infinite ease-in-out',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(0.95)', opacity: 1 },
                            '100%': { transform: 'scale(1.3)', opacity: 0 }
                          }
                        }}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Active Call Session
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Connected to: **{merchant.integrationName}**
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  startIcon={<Iconify icon="solar:phone-talk-bold" />}
                  onClick={disconnectSession}
                >
                  Hang Up
                </Button>
              </Box>

              {/* Speech State Feedback Bar */}
              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
                <ChipState label="Your Mic" active={isSpeaking} activeColor="primary.main" icon="solar:microphone-bold" />
                <Iconify icon="solar:transfer-horizontal-bold" color="text.secondary" />
                <ChipState label="AI Voice Output" active={isAiSpeaking} activeColor="success.main" icon="solar:volume-loud-bold" />
              </Stack>

              {/* Chat Log View */}
              <Typography variant="subtitle2">Dialogue Transcription Stream</Typography>
              <Paper variant="outlined" sx={{ p: 2, height: 200, overflowY: 'auto', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {chatLog.map((chat, idx) => {
                  if (chat.role === 'system') {
                    return (
                      <Typography key={idx} variant="caption" color="text.secondary" align="center" sx={{ fontStyle: 'italic', display: 'block' }}>
                        {chat.text}
                      </Typography>
                    );
                  }
                  const isUser = chat.role === 'user';
                  return (
                    <Box key={idx} sx={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: (theme) => isUser ? 'primary.main' : alpha(theme.palette.grey[500], 0.08),
                          color: isUser ? 'primary.contrastText' : 'text.primary',
                        }}
                      >
                        <Typography variant="body2">{chat.text}</Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: isUser ? 'right' : 'left' }}>
                        {chat.time}
                      </Typography>
                    </Box>
                  );
                })}
              </Paper>

              {/* Live SMS Checkout Receipt */}
              {smsLink && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                    border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.16)}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Iconify icon="solar:letter-bold" color="info.main" width={24} />
                    <Box>
                      <Typography variant="caption" color="info.main" fontWeight="bold" sx={{ display: 'block' }}>
                        REAL-TIME PINNACLE SMS DISPATCHED!
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Invoice checkout URL sent to **{callerPhone}**: 
                      </Typography>
                      <Link href={smsLink} target="_blank" rel="noopener" sx={{ display: 'block', fontSize: '11px', mt: 0.5, fontWeight: 'bold' }}>
                        {smsLink}
                      </Link>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close Sandbox
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Helper Chip Component for state feedback
function ChipState({ label, active, activeColor, icon }: { label: string; active: boolean; activeColor: string; icon: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        px: 2,
        py: 0.75,
        borderRadius: 5,
        border: '1px solid',
        borderColor: active ? activeColor : 'divider',
        bgcolor: active ? alpha(activeColor, 0.08) : 'transparent',
        color: active ? activeColor : 'text.secondary',
        transition: 'all 0.3s ease',
      }}
    >
      <Iconify icon={icon} width={16} />
      <Typography variant="caption" fontWeight="bold">{label}</Typography>
    </Stack>
  );
}

// Alpha Helper fallback
function alpha(color: string, opacity: number): string {
  if (color.startsWith('rgb')) return color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  // Simple Hex converter
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
