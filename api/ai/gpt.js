const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = function(app) {

    async function fetchGptOnline(prompt) {
        try {
            const { data: html } = await axios.get("https://gptonline.ai/id/chatgpt-online/");
            const $ = cheerio.load(html);
            const div = $('.wpaicg-chat-shortcode');
            const nonce = div.attr('data-nonce');
            const botId = div.attr('data-bot-id');
            const postId = div.attr('data-post-id');

            const form = new FormData();
            form.append("_wpnonce", nonce);
            form.append("post_id", postId);
            form.append("url", "https://gptonline.ai/id/chatgpt-online/");
            form.append("action", "wpaicg_chat_shortcode_message");
            form.append("message", prompt);
            form.append("bot_id", botId);
            form.append("chat_bot_identity", "custom_bot_1040");
            form.append("wpaicg_chat_history", "[]");
            form.append("wpaicg_chat_client_id", "LCgGOMeIOC");

            const headers = {
                ...form.getHeaders()
            };

            const response = await axios.post(
                "https://gptonline.ai/id/wp-admin/admin-ajax.php",
                form,
                { headers }
            );

            return response.data;

        } catch (error) {
            throw new Error('Gagal memproses permintaan ke GPT Online.');
        }
    }

    app.get('/ai/gpt', async (req, res) => {
        const { prompt } = req.query;

        if (!prompt) {
            return res.status(400).json({
                status: false,
                error: 'Parameter "prompt" diperlukan.'
            });
        }

        try {
            const result = await fetchGptOnline(prompt);
            res.json({
                status: true,
                result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                error: error.message
            });
        }
    });

};
