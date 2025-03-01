const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to capture a screenshot of a given URL
app.post('/', async (req, res) => {
    const { url, selectorId } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Launch Puppeteer with necessary flags
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
        const page = await browser.newPage();

        // Set viewport resolution
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1 // Adjust for higher DPI screens
        });

        // Increase timeout to ensure React fully renders
        await page.setDefaultNavigationTimeout(60000); // 60 seconds

        // Navigate to the given URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        if (selectorId) {
            await page.waitForSelector(selectorId, { timeout: 120000 });
        }

        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

        // Capture full-page screenshot
        const screenshotBuffer = await page.screenshot({ fullPage: true });

        // Close the browser
        await browser.close();

        // Set headers to return PNG image
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="screenshot.png"');
        res.send(screenshotBuffer);
    } catch (error) {
        console.error('Error capturing screenshot:', error);
        res.status(500).json({ error: 'Failed to capture screenshot' });
    }
});

app.post('/convert-to-pdf', async (req, res) => {
    const { url, selectorId } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Launch Puppeteer with necessary flags
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
        });
        const page = await browser.newPage();

        // Set viewport resolution
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1 // Adjust for higher DPI screens
        });

        // Increase timeout to ensure React fully renders
        //await page.setDefaultNavigationTimeout(1200000); // 60 seconds

        // Navigate to the given URL
        await page.goto(url, { waitUntil: 'networkidle2' });

        if (selectorId) {
            await page.waitForSelector(selectorId, { timeout: 120000 });
        }

        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 5000)));

        // Generate a PDF across multiple pages
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '5mm', right: '10mm', bottom: '20mm', left: '10mm' }
        });

        // Close the browser
        await browser.close();

        // Set headers to return PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0',() => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
