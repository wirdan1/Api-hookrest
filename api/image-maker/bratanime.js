const axios = require("axios")

module.exports = (app) => {
  app.get("/imagecreator/bratanime", async (req, res) => {
    const { text, apikey } = req.query

    if (!text) {
      return res.status(400).json({
        status: false,
        message: 'Parameter "text" wajib diisi. Contoh: /imagecreator/bratanime?text=saya%20suka%20anime',
      })
    }
    if (!apikey || (!global.apikeyf.includes(apikey) && !global.apikeyp.includes(apikey))) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }

    try {
      const apiUrl = `https://api.example.com/generate?text=${encodeURIComponent(text)}`
      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
      })

      res.set("Content-Type", "image/png") // atau sesuaikan dengan output API
      res.send(response.data)
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal mengambil gambar dari API eksternal",
        error: err.message,
      })
    }
  })
}
