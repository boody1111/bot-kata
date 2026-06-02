const axios = require('axios');

const headers = {
    'accept': 'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'en-US,en;q=0.9,ar;q=0.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'referer': 'https://www.pinterest.com/',
};

function collectUrls(value, urls) {
    if (!value) return;
    if (typeof value === 'string') {
        const matches = value.match(/https:\/\/i\.pinimg\.com\/[^"'\\\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s<>]*)?/gi) || [];
        for (const url of matches) urls.add(url.replace(/236x|474x|564x/g, '736x'));
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value) collectUrls(item, urls);
        return;
    }
    if (typeof value === 'object') {
        for (const key of ['orig', 'originals', '736x', '564x', '474x', '236x']) {
            if (value[key]?.url) collectUrls(value[key].url, urls);
        }
        for (const item of Object.values(value)) collectUrls(item, urls);
    }
}

async function searchPinterest(query, limit = 6) {
    const count = Math.min(Math.max(Number(limit) || 6, 1), 10);
    const data = encodeURIComponent(JSON.stringify({
        options: {
            query,
            scope: 'pins',
            bookmarks: [''],
            page_size: Math.max(count * 3, 25),
            field_set_key: 'unauth_react',
            no_fetch_context_on_resource: false
        },
        context: {}
    }));
    const sourceUrl = `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=${encodeURIComponent(sourceUrl)}&data=${data}`;
    const response = await axios.get(url, { headers, timeout: 15000, validateStatus: status => status < 500 });
    const urls = new Set();
    collectUrls(response.data, urls);
    return [...urls].filter(Boolean).slice(0, count * 2);
}

async function getImageStreams(query, limit = 6) {
    const urls = await searchPinterest(query, limit);
    const streams = [];
    for (const url of urls) {
        if (streams.length >= limit) break;
        try {
            const response = await axios.get(url, {
                headers,
                responseType: 'stream',
                timeout: 15000,
                validateStatus: status => status === 200
            });
            streams.push(response.data);
        } catch {}
    }
    return streams;
}

module.exports = {
    getImageStreams,
    searchPinterest
};