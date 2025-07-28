const axios = require('axios');
const FormData = require('form-data');

module.exports = function (app) {
  app.get('/tools/upscale', async (req, res) => {
    const { url } = req.query;

    if (!url || !/^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url)) {
      return res.status(400).json({
        status: false,
        message: 'Masukkan parameter ?url= dengan link gambar yang valid.'
      });
    }

    try {
      const imageRes = await axios.get(url, { responseType: 'arraybuffer' });
      const imageBuffer = imageRes.data;

      const form = new FormData();
      form.append('image', imageBuffer, {
        filename: 'upload.jpg',
        contentType: 'image/jpeg'
      });
      form.append('user_id', 'undefined');
      form.append('is_public', 'true');

      const headers = {
        ...form.getHeaders(),
        'Accept': '*/*',
        'Origin': 'https://picupscaler.com',
        'Referer': 'https://picupscaler.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      };

      const { data } = await axios.post('https://picupscaler.com/api/generate/handle', form, { headers });

      res.json({
        status: true,
        result: data
      });

    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Terjadi kesalahan saat memproses gambar.',
        error: error.message
      });
    }
  });
};
