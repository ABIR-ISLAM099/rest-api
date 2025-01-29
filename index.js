const express = require('express');
const { alldl } = require('imran-alldl');
const path = require('path');
const axios = require('axios');
const semver = require('semver');

const app = express();
const port = 3000;

// আপনার অ্যাপের বর্তমান ভার্সন
const currentVersion = '1.0.5';
let isApiEnabled = true; // API চালু আছে কিনা তা ট্র্যাক করার জন্য ফ্ল্যাগ

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, 'public', 'docs.html')));

// ভার্সন চেক করার ফাংশন
async function checkForUpdates() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/ABIR-ISLAM099/rest-api/main/package.json');
        const data = response.data;
        const latestVersion = data.version;

        if (semver.gt(latestVersion, currentVersion)) {
            console.log('নতুন আপডেট পাওয়া গেছে!');
            isApiEnabled = false; // API বন্ধ করুন
            applyUpdate(data);
        } else if (semver.lt(latestVersion, currentVersion)) {
            console.log('আপনার ভার্সন GitHub এর চেয়ে নতুন।');
            isApiEnabled = false; // API বন্ধ করুন
        } else {
            console.log('আপনি সর্বশেষ ভার্সন ব্যবহার করছেন।');
            isApiEnabled = true; // API চালু রাখুন
        }
    } catch (error) {
        console.error('আপডেট চেক করতে সমস্যা হয়েছে:', error.message);
        isApiEnabled = false; // এরর হলে API বন্ধ করুন
    }
}

// আপডেট প্রয়োগ করার ফাংশন
function applyUpdate(updateData) {
    console.log('আপডেট প্রয়োগ করা হচ্ছে...', updateData);
    // আপডেট প্রয়োগ করার লজিক যোগ করুন
}

// নিয়মিত আপডেট চেক করুন (উদাহরণস্বরূপ প্রতি 5 মিনিটে)
setInterval(checkForUpdates, 5 * 60 * 1000);

// প্রথমবার চেক করুন
checkForUpdates();

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
app.get('/check-version', async (req, res) => {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/ABIR-ISLAM099/rest-api/main/package.json');
        const data = response.data;
        const latestVersion = data.version;

        res.json({
            currentVersion,
            latestVersion,
            isLatest: semver.eq(latestVersion, currentVersion)
        });
    } catch (error) {
        console.error('ভার্সন চেক করতে সমস্যা হয়েছে:', error.message);
        res.status(500).json({ error: 'Failed to check version' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
