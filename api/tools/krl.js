const { infoRoute, tarifKereta, jadwalKereta } = require('../src/krlservice');

module.exports = function (app) {
  app.get('/krl/stations', async (req, res) => {
    const result = await infoRoute();
    res.status(result.code || 200).json(result);
  });

  app.get('/krl/fare', async (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?from= dan ?to= diperlukan'
      });
    }
    const result = await tarifKereta(from, to);
    res.status(result.code || 200).json(result);
  });

  app.get('/krl/schedule', async (req, res) => {
    const { station, from, to } = req.query;
    if (!station || !from || !to) {
      return res.status(400).json({
        status: false,
        message: 'Parameter ?station=, ?from=, dan ?to= diperlukan'
      });
    }
    const result = await jadwalKereta(station, from, to);
    res.status(result.code || 200).json(result);
  });
};
