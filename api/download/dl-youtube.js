const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = function (app) {
    const ytmp3ing = async (youtubeUrl, format = "mp3") => {
        const regYoutubeId = /https:\/\/(www.youtube.com\/watch\?v=|youtu.be\/|youtube.com\/shorts\/|youtube.com\/watch\?v=)([^&|^?]+)/;
        const videoId = youtubeUrl.match(regYoutubeId)?.[2];
        if (!videoId) throw new Error("Invalid YouTube link");

        const availableFormat = ["mp3", "mp4"];
        const formatIndex = availableFormat.indexOf(format.toLowerCase());
        if (formatIndex === -1) {
            throw new Error(`${format} is invalid format, available format: ${availableFormat.join(", ")}`);
        }

        const choosenUrlPath = ["/audio", "/video"][formatIndex];

        const getCookieAndToken = async () => {
            const res = await fetch("https://ytmp3.ing/");
            if (!res.ok) throw new Error(`Gagal fetch ${res.url}, status ${res.status}`);

            const rawHeaders = res.headers.raw();
            const cookieHeader = rawHeaders['set-cookie']?.[0];
            const html = await res.text();
            const csrfmiddlewaretoken = html.match(/value="([^"]+)"/)?.[1];

            if (!csrfmiddlewaretoken) throw new Error(`Gagal mendapatkan csrfmiddlewaretoken`);
            if (!cookieHeader) throw new Error(`Gagal mendapatkan cookie`);

            return {
                cookie: cookieHeader.split(';')[0],
                csrfmiddlewaretoken
            };
        };

        const { cookie, csrfmiddlewaretoken } = await getCookieAndToken();

        const body = `------WebKitFormBoundaryeByWolep\r\nContent-Disposition: form-data; name="url"\r\n\r\n${youtubeUrl}\r\n------WebKitFormBoundaryeByWolep--\r\n`;

        const res2 = await fetch(`https://ytmp3.ing${choosenUrlPath}`, {
            method: "POST",
            headers: {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryeByWolep",
                "x-csrftoken": csrfmiddlewaretoken,
                "cookie": cookie
            },
            body
        });

        if (!res2.ok) {
            throw new Error(`Gagal fetch ${res2.url}. Mungkin video terlalu panjang atau tidak didukung. Status ${res2.status}`);
        }

        let { url, filename } = await res2.json();
        const decodedUrl = Buffer.from(url, 'base64').toString('utf-8');

        return { filename, url: decodedUrl };
    };

    app.get('/download/youtube', async (req, res) => {
        const { url, format } = req.query;
        if (!url) return res.status(400).json({ status: false, error: 'Parameter "url" diperlukan.' });

        try {
            const result = await ytmp3ing(url, format || "mp3");
            res.json({ status: true, result });
        } catch (err) {
            res.status(500).json({ status: false, error: err.message });
        }
    });
};
