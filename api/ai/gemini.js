const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = function (app) {
  // Endpoint: /gemmy/chat?question=apa&imagePath=optional
  app.get('/gemmy/chat', async (req, res) => {
    const { question, imagePath } = req.query;

    if (!question) {
      return res.status(400).json({ status: false, message: 'Parameter ?question= wajib diisi.' });
    }

    try {
      const parts = [];

      if (imagePath) {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const ext = path.extname(imagePath).toLowerCase();

        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.webp') mimeType = 'image/webp';

        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        });
      }

      parts.push({ text: question });

      const data = {
        model: "projects/gemmy-ai-bdc03/locations/us-central1/publishers/google/models/gemini-1.5-flash",
        contents: [{ role: "user", parts }]
      };

      const response = await axios.post(
        'https://firebasevertexai.googleapis.com/v1beta/projects/gemmy-ai-bdc03/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent',
        JSON.stringify(data),
        {
          headers: {
            'User-Agent': 'Ktor client',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'x-goog-api-key': 'AIzaSyD6QwvrvnjU7j-R6fkOghfIVKwtvc7SmLk',
            'x-goog-api-client': 'gl-kotlin/2.2.0-ai fire/16.5.0',
            'x-firebase-appid': '1:652803432695:android:c4341db6033e62814f33f2',
            'x-firebase-appversion': '69',
            'x-firebase-appcheck': 'eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==',
            'accept-charset': 'UTF-8'
          }
        }
      );

      res.json({ status: true, result: response.data });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat memproses chat.',
        error: error.message
      });
    }
  });

  // Endpoint: /gemmy/texting?prompt=apa
  app.get('/gemmy/texting', async (req, res) => {
    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({ status: false, message: 'Parameter ?prompt= wajib diisi.' });
    }

    try {
      const data = {
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          includeRaiReason: true,
          aspectRatio: "1:1",
          safetySetting: "block_only_high",
          personGeneration: "allow_adult",
          addWatermark: false,
          imageOutputOptions: {
            mimeType: "image/jpeg",
            compressionQuality: 100
          }
        }
      };

      const response = await axios.post(
        'https://firebasevertexai.googleapis.com/v1beta/projects/gemmy-ai-bdc03/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict',
        JSON.stringify(data),
        {
          headers: {
            'User-Agent': 'Ktor client',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'x-goog-api-key': 'AIzaSyD6QwvrvnjU7j-R6fkOghfIVKwtvc7SmLk',
            'x-goog-api-client': 'gl-kotlin/2.2.0-ai fire/16.5.0',
            'x-firebase-appid': '1:652803432695:android:c4341db6033e62814f33f2',
            'x-firebase-appversion': '69',
            'x-firebase-appcheck': 'eyJlcnJvciI6IlVOS05PV05fRVJST1IifQ==',
            'accept-charset': 'UTF-8'
          }
        }
      );

      const predictions = response.data?.predictions || [];
      const savedFiles = [];

      for (let i = 0; i < predictions.length; i++) {
        const prediction = predictions[i];
        const base64Data = prediction.bytesBase64Encoded;
        const mimeType = prediction.mimeType;

        let extension = '.jpg';
        if (mimeType === 'image/png') extension = '.png';
        else if (mimeType === 'image/gif') extension = '.gif';
        else if (mimeType === 'image/webp') extension = '.webp';

        const timestamp = Date.now();
        const filename = `image_${timestamp}_${i}${extension}`;
        const filepath = path.join(__dirname, filename);

        fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));

        savedFiles.push({ filename, filepath, mimeType });
      }

      res.json({
        status: true,
        savedFiles
      });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat generate gambar.',
        error: error.message
      });
    }
  });
};
