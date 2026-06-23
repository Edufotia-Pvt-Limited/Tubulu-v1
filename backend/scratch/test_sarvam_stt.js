const axios = require('axios');
const FormData = require('form-data');

const sarvamKey = 'sk_tidnx9y0_GX5YSvJjW3WEBISJWGl8D3Ap';
const sampleAudioUrl = 'https://www.w3schools.com/html/horse.mp3';

async function testSarvam() {
    try {
        console.log('Downloading sample audio...');
        const audioResponse = await axios.get(sampleAudioUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(audioResponse.data);
        
        console.log('Sending to Sarvam STT...');
        const form = new FormData();
        form.append('file', fileBuffer, {
            filename: 'speech_audio.wav',
            contentType: 'audio/mpeg'
        });
        form.append('model', 'saaras:v3');

        const response = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
            headers: {
                ...form.getHeaders(),
                'api-subscription-key': sarvamKey
            },
            timeout: 30000
        });

        console.log('Sarvam Response:', response.data);
    } catch (e) {
        console.error('Sarvam Failed:', e.message);
        if (e.response) {
            console.error('Response data:', e.response.data);
        }
    }
}

testSarvam();
