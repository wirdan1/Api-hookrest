const axios = require('axios');

module.exports = function (app) {
  app.get('/game/tebakbendera', async (req, res) => {
    try {
      const apiUrl = 'https://api.siputzx.my.id/api/games/tebakbendera';
      const response = await axios.get(apiUrl);

      res.json({
        status: true,
        game: 'Tebak Bendera',
        result: response.data.data // berisi { name: ..., flag: ... }
      });
    } catch (err) {
      res.status(500).json({
        status: false,
        message: 'Gagal mengambil data dari API eksternal',
        error: err.message
      });
    }
  });
};
