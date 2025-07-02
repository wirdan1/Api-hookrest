const axios = require("axios")
const cheerio = require("cheerio")

async function npmstalk(packageName) {
  const stalk = await axios.get("https://registry.npmjs.org/" + packageName)
  const versions = stalk.data.versions
  const allver = Object.keys(versions)
  const verLatest = allver[allver.length - 1]
  const verPublish = allver[0]
  const packageLatest = versions[verLatest]
  return {
    name: packageName,
    versionLatest: verLatest,
    versionPublish: verPublish,
    versionUpdate: allver.length,
    latestDependencies: Object.keys(packageLatest.dependencies).length,
    publishDependencies: Object.keys(versions[verPublish].dependencies).length,
    publishTime: stalk.data.time.created,
    latestPublishTime: stalk.data.time[verLatest],
  }
}

module.exports = (app) => {
  app.get("/stalk/npm", async (req, res) => {
    const { apikey } = req.query
    if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
    const { name } = req.query
    if (!name) return res.json({ status: false, error: "Name is required" })
    try {
      const results = await npmstalk(name)
      res.status(200).json({
        status: true,
        result: results,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
