module.exports = (app) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai")

  const genAI = new GoogleGenerativeAI("AIzaSyAlbK2NP8qM8vLzfJmtGSFE_z4dLADvYso")

  async function Llama(prom) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent(prom)
    const response = await result.response
    const texts = response.text()
    return texts
  }

  app.get("/ai/gemini", async (req, res) => {
    try {
      const { text, apikey } = req.query
      if (!text) {
        return res.json({ status: false, error: "Text is required" })
      }
      if (!apikey || (!global.apikeyf.includes(apikey) && !global.apikeyp.includes(apikey))) {
        return res.json({ status: false, error: "Invalid or missing API key" })
      }
      const result = await Llama(text)
      res.status(200).json({
        status: true,
        result: result,
      })
    } catch (error) {
      res.json({ status: false, error: error.message })
    }
  })
}
