module.exports = (app) => {
  app.get("/imagecreator/brat", async (req, res) => {
    try {
      const { apikey, text } = req.query
      if (!apikey || !global.apikeyp.includes(apikey)) {
        return res.json({ status: false, error: "Invalid or missing API key" })
      }
      const pedo = await getBuffer(`https://brat.caliphdev.com/api/brat?text=${text}`)
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": pedo.length,
      })
      res.end(pedo)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })

  app.get("/imagecreator/bratvideo", async (req, res) => {
    try {
      const { apikey, text } = req.query
      if (!apikey || !global.apikeyp.includes(apikey)) {
        return res.json({ status: false, error: "Invalid or missing API key" })
      }
      const pedo = await getBuffer(`https://skyzxu-brat.hf.space/brat-animated?text=${text}`)
      res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Length": pedo.length,
      })
      res.end(pedo)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
