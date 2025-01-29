const express = require('express');
const { alldl } = require('imran-alldl');
const path = require('path');
const axios = require('axios');
const semver = require('semver');

const app = express();
const port = 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, 'public', 'docs.html')));


// API রুট
app.get('/api', async (req, res) => {
    if (!isApiEnabled) {
        return res.status(503).json({ error: 'API is temporarily disabled due to version mismatch.' });
    }

    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const data = await alldl(url);
        res.json(data);
        console.log(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download media' });
    }
});

// SIM রুট
app.get('/sim', async (req, res) => {
    if (!isApiEnabled) {
        return res.status(503).json({ error: 'API is temporarily disabled due to version mismatch.' });
    }

    const { ask } = req.query;
    if (!ask) {
        return res.status(400).json({ error: 'The "ask" query parameter is required.' });
    }

    try {
        const response = await axios.get('http://5.9.12.94:14642/sim', {
            params: { ask }
        });

        if (response.data) {
            return res.json(response.data);
        } else {
            return res.status(500).json({ error: 'Error communicating with the external API' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get response from external API' });
    }
});

// ভার্সন চেক করার এন্ডপয়েন্ট


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
