async function videy(url) {
  try {
    const id = url.split("id=")[1]
    let typ = ".mp4"
    if (id.length === 9 && id[8] === "2") {
      typ = ".mov"
    }
    return `https://cdn.videy.co/${id + typ}`
  } catch (error) {
    console.error(`Error fetching the URL: ${error.message}`)
  }
}

module.exports = (app) => {
  app.get("/download/videy", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
      const { url } = req.query
      if (!url) {
        return res.json({ status: false, error: "Url is required" })
      }
      const results = await videy(url)
      res.status(200).json({
        status: true,
        result: results,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
