const express = require('express');
const { alldl } = require('imran-alldl');
const path = require('path');
const axios = require('axios');
const semver = require('semver'); // ভার্সন তুলনার জন্য semver লাইব্রেরি যোগ করুন

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get("/docs", (req, res) => res.sendFile(path.join(__dirname, 'public', 'docs.html')));

// একটি ফাংশন তৈরি করুন যা সার্ভার থেকে ডেটা চেক করে
async function checkForUpdates() {
    try {
        // GitHub থেকে package.json ফাইল ফেচ করুন (Raw URL ব্যবহার করুন)
        const response = await axios.get('https://raw.githubusercontent.com/ABIR-ISLAM099/rest-api/main/package.json');
        
        // ডেটা JSON হিসেবে পার্স করুন
        const data = response.data;

        // আপনার কারেন্ট ভার্সন চেক করুন
        const currentVersion = '1.0.0'; // আপনার অ্যাপের বর্তমান ভার্সন
        const latestVersion = data.version; // GitHub থেকে প্রাপ্ত সর্বশেষ ভার্সন

        // ভার্সন তুলনা করুন
        if (semver.gt(latestVersion, currentVersion)) {
            console.log('নতুন আপডেট পাওয়া গেছে!');
            applyUpdate(data); // আপডেট প্রয়োগ করুন
        } else {
            console.log('আপনি সর্বশেষ ভার্সন ব্যবহার করছেন।');
        }
    } catch (error) {
        console.error('আপডেট চেক করতে সমস্যা হয়েছে:', error.message);
    }
}

// আপডেট প্রয়োগ করার ফাংশন
function applyUpdate(updateData) {
    console.log('আপডেট প্রয়োগ করা হচ্ছে...', updateData);
    // এখানে আপনার কোড আপডেট করুন, যেমন নতুন ফাইল লোড করা বা UI আপডেট করা
    // উদাহরণ: নতুন ভার্সন ডাউনলোড বা ইন্সটল করার লজিক যোগ করুন
}

// নিয়মিত আপডেট চেক করুন (উদাহরণস্বরূপ প্রতি 5 মিনিটে)
setInterval(checkForUpdates, 5 * 60 * 1000);

// প্রথমবার চেক করুন
checkForUpdates();

app.get('/api', async (req, res) => {
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

app.get('/sim', async (req, res) => {
    const { ask } = req.query;

    if (!ask) {
        return res.status(400).json({ error: 'The "ask" query parameter is required.' });
    }

    try {
        const response = await axios.get('http://5.9.12.94:14642/sim', {
            params: {
                ask: ask, 
            }
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
