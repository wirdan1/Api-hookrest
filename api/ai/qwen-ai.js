const axios = require('axios');
const https = require('https');

module.exports = function (app) {
  app.get('/ai/qwen', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?prompt= tidak boleh kosong.'
      });
    }

    function generateSessionHash(length = 11) {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let hash = '';
      for (let i = 0; i < length; i++) {
        hash += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return hash;
    }

    const session_hash = generateSessionHash();

    const headers = {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
      "Accept": "*/*",
      "Content-Type": "application/json"
    };

    const payload = {
      data: [
        prompt,
        [],
        "saya adalah asisten yang baik"
      ],
      event_data: null,
      fn_index: 1,
      trigger_id: 14,
      session_hash: session_hash
    };

    const requestUrl = `https://qwen-qwen2-72b-instruct.hf.space/queue/join?__theme=system`;
    const streamUrl = `https://qwen-qwen2-72b-instruct.hf.space/queue/data?session_hash=${session_hash}`;

    try {
      await axios.post(requestUrl, payload, { headers });

      https.get(streamUrl, { headers }, (streamRes) => {
        let buffer = '';

        streamRes.on('data', (chunk) => {
          buffer += chunk.toString();

          const parts = buffer.split('\n\n');
          buffer = parts.pop();

          for (const part of parts) {
            if (part.startsWith('data:')) {
              const json = part.replace('data: ', '').trim();

              try {
                const parsed = JSON.parse(json);
                if (parsed.msg === 'process_completed') {
                  const text = parsed.output?.data?.[1]?.[0]?.[1];
                  return res.json({
                    status: true,
                    result: text || '(kosong)'
                  });
                }
              } catch (err) {
                // parsing gagal → abaikan
              }
            }
          }
        });

        streamRes.on('error', (err) => {
          return res.status(500).json({ status: false, message: 'Stream error: ' + err.message });
        });

        streamRes.on('end', () => {
          return res.status(500).json({ status: false, message: 'Stream selesai tanpa hasil.' });
        });
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan: ' + error.message
      });
    }
  });
};
