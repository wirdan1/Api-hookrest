const axios = require("axios")

module.exports = (app) => {
  app.get("/search/npm", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
      const { q } = req.query
      if (!q) return res.json({ status: false, error: "Query is required" })

      const data = await axios
        .get(`https://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(q)}`)
        .then((i) => i.data)
      const hasil = []
      for (const i of data.objects.slice(0, 20)) {
        hasil.push({
          title: i.package.name + "@^" + i.package.version,
          download: i.downloads,
          author: i.package.publisher.username,
          update: i.package.date,
          links: i.package.links,
        })
      }
      const results = await hasil
      res.status(200).json({
        status: true,
        result: results,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
