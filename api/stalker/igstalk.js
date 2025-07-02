const axios = require("axios")
const cheerio = require("cheerio")

/**
 * Extracts post data from a list of URLs.
 * @param {string[]} array - List of URLs to fetch and extract data from.
 * @returns {Promise<Object[]>} - Returns an array of post objects containing title, likes, comments, upload date, and downloadable media.
 * @example
 * extractPost(["https://dumpor.io/post-url"]).then(console.log);
 */
async function extractPost(array) {
  const result = []
  for (const url of array) {
    const request = await axios
      .get(url, {
        headers: {
          "User-Agent": "Posify/1.0.0",
          Referer: "dumpor.io",
        },
      })
      .catch((e) => e.response)

    if (request.status !== 200)
      return Promise.reject({
        msg: "Failed to fetch post data!",
        url,
      })

    const $ = cheerio.load(request.data)
    $(".card").each((a, i) => {
      const items = []
      $(i)
        .find(".carousel .carousel-item")
        .each((ul, el) => {
          const results = $(el).find("img").attr("src") || $(el).find("video").attr("src")
          items.push(results)
        })

      result.push({
        url,
        title: $(i).find(".card-body").find("p").text().trim(),
        likes: $(i).find(".card-body").eq(2).find("div").eq(0).text().trim(),
        comments: $(i).find(".card-body").eq(2).find("div").eq(1).text().trim(),
        uploaded: $(i).find(".card-body").eq(2).find("div").eq(2).text().trim(),
        downloads: items,
      })
    })
  }
  return result
}

class DumPor {
  /**
   * Fetches user profile and posts from Dumpor.
   * @param {string} username - The username to stalk.
   * @returns {Promise<Object>} - Returns user metadata and a list of posts.
   * @example
   * data.stalk("otaku anime Indonesia").then(console.log);
   */
  stalk = async function stalk(username) {
    return new Promise(async (resolve, reject) => {
      const request = await axios
        .get(`https://dumpor.io/v/${username.split(" ").join("_").toLowerCase()}`, {
          headers: {
            "User-Agent": "Posify/1.0.0",
            Referer: "dumpor.io",
          },
        })
        .catch((e) => e.response)

      if (request.status !== 200)
        return reject({
          msg: "Failed to fetch user data!",
          error: request,
        })

      const $ = cheerio.load(request.data)
      const array = []
      const result = {
        metadata: {},
        posts: [],
      }

      result.metadata.name = $(".items-top h2").text().trim()
      result.metadata.username = $(".items-top h1").text().trim()
      result.metadata.bio = $(".items-top .text-sm").text().trim()
      $(".stats .stat").each((a, i) => {
        const name = $(i).find(".stat-title").text().trim().toLowerCase()
        const value = $(i).find(".stat-value").text().trim()
        result.metadata[name] = value
      })

      result.metadata.avatar = $(".avatar img").attr("src")
      $(".card").each(async (a, i) => {
        const url = "https://dumpor.io/" + $(i).find("a").attr("href")
        array.push(url)
      })

      result.posts = await extractPost(array)
      resolve(result)
    })
  }

  /**
   * Searches for users on Dumpor by username.
   * @param {string} username - The username to search for.
   * @returns {Promise<Object[]>} - Returns an array of user search results.
   * @example
   * data.search("otaku anime").then(console.log);
   */
  search = async function search(username) {
    return new Promise(async (resolve, reject) => {
      const request = await axios
        .get(`https://dumpor.io/search?query=${encodeURIComponent(username)}`, {
          headers: {
            "User-Agent": "Posify/1.0.0",
            Referer: "dumpor.io",
          },
        })
        .catch((e) => e.response)

      if (request.status !== 200)
        return reject({
          msg: "Failed to fetch search data!",
          error: request,
        })

      const $ = cheerio.load(request.data)
      const result = []

      $(".avatar").each((a, i) => {
        result.push({
          name: $(i).find(".bg-neutral span").text().trim(),
          username: $(i).find("a").text().trim(),
          avatar: $(i).find(".w-32 img").attr("src"),
        })
      })

      resolve(result)
    })
  }
}

module.exports = (app) => {
  app.get("/stalk/instagram", async (req, res) => {
    const { apikey } = req.query
    if (!global.apikeyf.includes(apikey)) return res.json({ status: false, error: "Apikey invalid" })
    const { username } = req.query
    if (!username) return res.json({ status: false, error: "User is required" })

    try {
      const gg = await new DumPor()
      const results = await gg.stalk(username)
      res.status(200).json({
        status: true,
        result: results.metadata,
      })
    } catch (error) {
      res.status(500).send(`Error: ${error.message}`)
    }
  })
}
