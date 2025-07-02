const fetch = require("node-fetch")

async function gitClone(urls) {
  const regex = /(?:https|git)(?::\/\/|@)github\.com[/:]([^/:]+)\/(.+)/i
  try {
    let [, user, repo] = urls.match(regex) || []
    repo = repo.replace(/.git$/, "")
    const url = `https://api.github.com/repos/${user}/${repo}/zipball`
    const filename = (await fetch(url, { method: "HEAD" })).headers
      .get("content-disposition")
      .match(/attachment; filename=(.*)/)[1]
    return {
      download: url,
      filename: filename,
    }
  } catch (err) {
    throw err
  }
}

module.exports = (app) => {
  app.get("/download/github", async (req, res) => {
    const { apikey } = req.query
    if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
    const { url } = req.query
    if (!url) {
      return res.json({ status: false, error: "Url is required" })
    }
    try {
      const results = await gitClone(url)
      res.status(200).json({
        status: true,
        result: results,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
