const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = function(app) {

    const yt = {
        headers: {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br, zstd",
            "accept-language": "en-GB,en;q=0.9,en-US;q=0.8",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0"
        },

        mintaJson: async (desc, url, headers, method = "get", body) => {
            try {
                const res = await fetch(url, { headers, method, body });
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}\n${await res.text()}`);
                return await res.json();
            } catch (err) {
                throw new Error(`Fetch gagal: ${desc}\nkarena: ${err.message}`);
            }
        },

        search: async (query) => {
            if (!query) throw new Error("Query tidak valid atau kosong");
            const headers = {
                ...yt.headers,
                origin: "https://v2.www-y2mate.com",
                referer: "https://v2.www-y2mate.com/"
            };
            return await yt.mintaJson("search", `https://wwd.mp3juice.blog/search.php?q=${encodeURIComponent(query)}`, headers);
        },

        getKey: async () => {
            const headers = {
                "content-type": "application/json",
                origin: "https://iframe.y2meta-uk.com",
                referer: "https://iframe.y2meta-uk.com/",
                ...yt.headers
            };
            return await yt.mintaJson("get key", "https://api.mp3youtube.cc/v2/sanity/key", headers);
        },

        handleFormat: (link, formatId) => {
            const listFormat = ["128kbps", "320kbps", "144p", "240p", "360p", "720p", "1080p"];
            if (!listFormat.includes(formatId)) throw new Error(`${formatId} bukan format yang valid.`);

            const match = formatId.match(/(\d+)(\w+)/);
            const format = match[2] === "kbps" ? "mp3" : "mp4";
            const audioBitrate = format === "mp3" ? match[1] : 128;
            const videoQuality = format === "mp4" ? match[1] : 720;

            return {
                link,
                format,
                audioBitrate,
                videoQuality,
                filenameStyle: "pretty",
                vCodec: "h264"
            };
        },

        convert: async (youtubeUrl, formatId) => {
            const { key } = await yt.getKey();
            const headers = {
                "content-type": "application/x-www-form-urlencoded",
                Key: key,
                origin: "https://iframe.y2meta-uk.com",
                referer: "https://iframe.y2meta-uk.com/",
                ...yt.headers
            };
            const payload = yt.handleFormat(youtubeUrl, formatId);
            const body = new URLSearchParams(payload);
            const json = await yt.mintaJson("convert", "https://api.mp3youtube.cc/v2/converter", headers, "post", body);
            json.chosenFormat = formatId;
            return json;
        },

        searchAndDownload: async (query, formatId = "128kbps") => {
            const searchResult = await yt.search(query);
            const youtubeUrl = `https://youtu.be/${searchResult.items[0].id}`;
            return await yt.convert(youtubeUrl, formatId);
        }
    };

    app.get('/download/play', async (req, res) => {
        const { q, format } = req.query;
        if (!q) {
            return res.status(400).json({ status: false, error: 'Parameter "q" diperlukan.' });
        }

        try {
            const result = await yt.searchAndDownload(q, format || "128kbps");
            res.json({ status: true, result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });

};
