module.exports = (app) => {
  app.get("/search/spotify", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
      const { q } = req.query
      if (!q) {
        return res.json({ status: false, error: "Query is required" })
      }
      const results = await global.fetchJson(`https://fastrestapis.fasturl.cloud/music/spotify?name=${q}`)
      res.status(200).json({
        status: true,
        result: results.result,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
