const axios = require("axios")
const FormData = require("form-data")
const { fromBuffer } = require("file-type")
const qs = require("qs")

const tool = ["removebg", "enhance", "upscale", "restore", "colorize"]

const pxpic = {
  upload: async (filePath) => {
    const buffer = filePath
    const { ext, mime } = (await fromBuffer(buffer)) || {}
    const fileName = Date.now() + "." + ext

    const folder = "uploads"
    const responsej = await axios.post(
      "https://pxpic.com/getSignedUrl",
      { folder, fileName },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const { presignedUrl } = responsej.data

    await axios.put(presignedUrl, buffer, {
      headers: {
        "Content-Type": mime,
      },
    })

    const cdnDomain = "https://files.fotoenhancer.com/uploads/"
    const sourceFileUrl = cdnDomain + fileName

    return sourceFileUrl
  },
  create: async (filePath, tools) => {
    if (!tool.includes(tools)) {
      return `Pilih salah satu dari tools ini: ${tool.join(", ")}`
    }
    const url = await pxpic.upload(filePath)
    const data = qs.stringify({
      imageUrl: url,
      targetFormat: "png",
      needCompress: "no",
      imageQuality: "100",
      compressLevel: "6",
      fileOriginalExtension: "png",
      aiFunction: tools,
      upscalingLevel: "",
    })

    const config = {
      method: "POST",
      url: "https://pxpic.com/callAiFunction",
      headers: {
        "User-Agent": "Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
        "Content-Type": "application/x-www-form-urlencoded",
        "accept-language": "id-ID",
      },
      data: data,
    }

    const api = await axios.request(config)
    return api.data
  },
}

module.exports = (app) => {
  app.get("/imagecreator/removebg", async (req, res) => {
    const { apikey, url } = req.query
    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }
    try {
      const image = await getBuffer(url)
      const result = await pxpic.create(image, "removebg")
      res.status(200).json({
        status: true,
        result: result.resultImageUrl,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })

  app.get("/imagecreator/remini", async (req, res) => {
    const { apikey, url } = req.query
    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }
    try {
      const image = await getBuffer(url)
      const result = await pxpic.create(image, "enhance")
      res.status(200).json({
        status: true,
        result: result.resultImageUrl,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })

  app.get("/imagecreator/upscale", async (req, res) => {
    const { apikey, url } = req.query
    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }
    try {
      const image = await getBuffer(url)
      const result = await pxpic.create(image, "upscale")
      res.status(200).json({
        status: true,
        result: result.resultImageUrl,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })

  app.get("/imagecreator/colorize", async (req, res) => {
    const { apikey, url } = req.query
    if (!apikey || !global.apikeyp.includes(apikey)) {
      return res.json({ status: false, error: "Invalid or missing API key" })
    }
    try {
      const image = await getBuffer(url)
      const result = await pxpic.create(image, "colorize")
      res.status(200).json({
        status: true,
        result: result.resultImageUrl,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
