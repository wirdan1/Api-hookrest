async function anim() {
  try {
    const data = `https://img12.pixhost.to/images/507/570627648_skyzopedia.jpg`
    const response = await getBuffer(data)
    return response
  } catch (error) {
    throw error
  }
}

module.exports = function papayangApp(app) {
  app.get("/random/papayang", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
      const pedo = await anim()
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": pedo.length,
      })
      res.end(pedo)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
