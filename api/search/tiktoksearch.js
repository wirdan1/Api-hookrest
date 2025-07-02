const axios = require("axios")
const FormData = require("form-data")

const ttSearch = async (query) => {
  try {
    const d = new FormData()
    d.append("keywords", query)
    d.append("count", 15)
    d.append("cursor", 0)
    d.append("web", 1)
    d.append("hd", 1)

    const h = {
      headers: {
        ...d.getHeaders(),
      },
    }

    const { data } = await axios.post("https://tikwm.com/api/feed/search", d, h)

    const baseURL = "https://tikwm.com"

    const videos = data.data.videos.map((video) => {
      return {
        ...video,
        play: baseURL + video.play,
        wmplay: baseURL + video.wmplay,
        music: baseURL + video.music,
        cover: baseURL + video.cover,
        avatar: baseURL + video.avatar,
      }
    })

    return videos
  } catch (e) {
    return e
  }
}

module.exports = (app) => {
  app.get("/search/tiktok", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
      const { q } = req.query
      if (!q) return res.json({ status: false, error: "Query is required" })
      const results = await ttSearch(q)
      res.status(200).json({
        status: true,
        result: results,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
