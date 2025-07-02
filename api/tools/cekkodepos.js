const axios = require("axios")

module.exports = (app) => {
  app.get("/tools/cekkodepos", async (req, res) => {
    const { q, apikey } = req.query
    if (!apikey || (!global.apikeyf.includes(apikey) && !global.apikeyp.includes(apikey))) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }

    if (!q) {
      return res.status(400).json({
        status: false,
        message: "Masukkan nama kota atau kecamatan, contoh: /tools/cekkodepos?q=bandung",
      })
    }

    try {
      const response = await axios.get(`https://kodepos.vercel.app/search?q=${encodeURIComponent(q)}`)
      const results = response.data.data

      if (!results || results.length === 0) {
        return res.status(404).json({ status: false, message: "Data tidak ditemukan" })
      }

      const list = results.map((item) => ({
        kelurahan: item.urban,
        kecamatan: item.subdistrict,
        kota: item.city,
        provinsi: item.province,
        kodepos: item.postalcode,
      }))

      res.json({
        status: true,
        query: q,
        result: list,
      })
    } catch (error) {
      res.status(500).json({ status: false, message: "Gagal mengambil data kode pos" })
    }
  })
}
