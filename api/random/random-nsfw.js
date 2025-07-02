module.exports = (app) => {
  async function anim() {
    try {
      const type = ["blowjob", "neko", "trap", "waifu"]
      const rn = type[Math.floor(Math.random() * type.length)]
      const data = await fetchJson(`https://api.waifu.pics/nsfw/${rn}`)
      const response = await getBuffer(data.url)
      return response
    } catch (error) {
      throw error
    }
  }
  app.get("/random/nsfw", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!apikey || !global.apikeyp.includes(apikey)) {
        return res.json({ status: false, error: "Invalid or missing API key" })
      }
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
