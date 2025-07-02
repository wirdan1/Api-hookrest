const axios = require("axios")

function encodeEmoji(emoji) {
  return [...emoji].map((char) => char.codePointAt(0).toString(16)).join("")
}

async function getBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" })
  return response.data
}

module.exports = (app) => {
  app.get("/tools/emojitogif", async (req, res) => {
    const { apikey, emoji } = req.query
    if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
    const unik = await encodeEmoji(emoji)
    const image = await getBuffer(`https://fonts.gstatic.com/s/e/notoemoji/latest/${unik}/512.webp`)
    try {
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Length": image.length,
      })
      res.end(image)
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
