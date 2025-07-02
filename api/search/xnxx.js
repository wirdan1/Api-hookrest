const fetch = require("node-fetch")
const cheerio = require("cheerio")

function xnxxdl(URL) {
  return new Promise((resolve, reject) => {
    fetch(`${URL}`, { method: "get" })
      .then((res) => res.text())
      .then((res) => {
        const $ = cheerio.load(res, {
          xmlMode: false,
        })
        const title = $('meta[property="og:title"]').attr("content")
        const duration = $('meta[property="og:duration"]').attr("content")
        const image = $('meta[property="og:image"]').attr("content")
        const videoType = $('meta[property="og:video:type"]').attr("content")
        const videoWidth = $('meta[property="og:video:width"]').attr("content")
        const videoHeight = $('meta[property="og:video:height"]').attr("content")
        const info = $("span.metadata").text()
        const videoScript = $("#video-player-bg > script:nth-child(6)").html()
        const files = {
          low: (videoScript.match("html5player.setVideoUrlLow$$'(.*?)'$$;") || [])[1],
          high: videoScript.match("html5player.setVideoUrlHigh$$'(.*?)'$$;" || [])[1],
          HLS: videoScript.match("html5player.setVideoHLS$$'(.*?)'$$;" || [])[1],
          thumb: videoScript.match("html5player.setThumbUrl$$'(.*?)'$$;" || [])[1],
          thumb69: videoScript.match("html5player.setThumbUrl169$$'(.*?)'$$;" || [])[1],
          thumbSlide: videoScript.match("html5player.setThumbSlide$$'(.*?)'$$;" || [])[1],
          thumbSlideBig: videoScript.match("html5player.setThumbSlideBig$$'(.*?)'$$;" || [])[1],
        }
        resolve({
          status: 200,
          result: {
            title,
            URL,
            duration,
            image,
            videoType,
            videoWidth,
            videoHeight,
            info,
            files,
          },
        })
      })
      .catch((err) => reject({ code: 503, status: false, result: err }))
  })
}

function xnxxsearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = "https://www.xnxx.com"
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, { method: "get" })
      .then((ress) => ress.text())
      .then((ress1) => {
        const $ = cheerio.load(ress1, {
          xmlMode: false,
        })
        const title = []
        const url = []
        const desc = []
        const results = []

        $("div.mozaique").each((a, b) => {
          $(b)
            .find("div.thumb")
            .each((c, d) => {
              url.push(baseurl + $(d).find("a").attr("href").replace("/THUMBNUM/", "/"))
            })
        })
        $("div.mozaique").each((a, b) => {
          $(b)
            .find("div.thumb-under")
            .each((c, d) => {
              desc.push($(d).find("p.metadata").text())
              $(d)
                .find("a")
                .each((e, f) => {
                  title.push($(f).attr("title"))
                })
            })
        })
        for (let i = 0; i < title.length; i++) {
          results.push({
            title: title[i],
            info: desc[i],
            link: url[i],
          })
        }
        resolve({
          code: 200,
          status: true,
          result: results,
        })
      })
      .catch((err) => reject({ code: 503, status: false, result: err }))
  })
}

module.exports = (app) => {
  app.get("/search/xnxx", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!apikey || !global.apikeyp.includes(apikey)) {
        return res.json({ status: false, error: "Invalid or missing API key" })
      }
      const { q } = req.query
      if (!q) return res.json({ status: false, error: "Query is required" })
      const results = await xnxxsearch(q)
      res.status(200).json({
        status: true,
        result: results.result,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })

  app.get("/download/xnxx", async (req, res) => {
    try {
      const { apikey } = req.query
      if (!apikey || !global.apikeyp.includes(apikey)) {
        return res.json({ status: false, error: "Invalid or missing API key" })
      }
      const { url } = req.query
      if (!url) return res.json({ status: false, error: "Url is required" })
      const results = await xnxxdl(url)
      res.status(200).json({
        status: true,
        result: results.result,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
