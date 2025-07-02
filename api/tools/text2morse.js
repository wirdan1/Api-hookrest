const axios = require("axios")

module.exports = (app) => {
  app.get("/tools/text2morse", async (req, res) => {
    const { text, apikey } = req.query

    if (!apikey || (!global.apikeyf.includes(apikey) && !global.apikeyp.includes(apikey))) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /tools/text2morse?text=halo dunia',
      })
    }

    try {
      const apiUrl = `https://api.nekorinn.my.id/tools/text2morse?text=${encodeURIComponent(text)}`
      const response = await axios.get(apiUrl)

      res.json({
        status: true,
        result: response.data.result || response.data,
      })
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil data dari API eksternal",
        error: err.message,
      })
    }
  })
}
