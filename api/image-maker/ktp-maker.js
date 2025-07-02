const axios = require("axios")

module.exports = (app) => {
  app.get("/imagecreator/ktp-maker", async (req, res) => {
    const { nama, nik, ttl, jk, alamat, agama, status, pekerjaan, kewarganegaraan, image, apikey } = req.query

    if (!nama || !nik || !ttl || !jk || !alamat || !agama || !status || !pekerjaan || !kewarganegaraan || !image) {
      return res.status(400).json({
        status: false,
        message:
          "Semua parameter wajib diisi: nama, nik, ttl, jk, alamat, agama, status, pekerjaan, kewarganegaraan, image (URL foto)",
      })
    }
    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }

    try {
      const apiUrl = `https://api.siputzx.my.id/api/maker/ktp?nama=${encodeURIComponent(nama)}&nik=${nik}&ttl=${encodeURIComponent(ttl)}&jk=${encodeURIComponent(jk)}&alamat=${encodeURIComponent(alamat)}&agama=${encodeURIComponent(agama)}&status=${encodeURIComponent(status)}&pekerjaan=${encodeURIComponent(pekerjaan)}&kewarganegaraan=${encodeURIComponent(kewarganegaraan)}&image=${encodeURIComponent(image)}`
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" })

      res.set("Content-Type", "image/png")
      res.send(response.data)
    } catch (err) {
      res.status(500).json({
        status: false,
        message: "Gagal membuat KTP",
        error: err.message,
      })
    }
  })
}
