'use strict';
const chromium = require('chrome-aws-lambda');
const base64 = require('base-64');
const utf8 = require('utf8');

function getUrlFromEventParameter(event) {
    if (event.queryStringParameters && event.queryStringParameters['url']) {
        return event.queryStringParameters['url'];
    }
    return '';
}

async function renderPdfFromUrl(url) {
    let browser = null;
    let pdfBuffer = null;
    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });
        const page = await browser.newPage();
        await page.goto(url, { 
            waitUntil: ['domcontentloaded', 'load', "networkidle0"]
        });
        //pdfBuffer = await page.content();
        pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '1cm',
                right: '1cm',
                bottom: '1cm',
                left: '1cm',
            },
        });
    } catch (error) {
        console.log(error);
        return null;
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
    return pdfBuffer;
}

exports.handler = async (event, context) => {
    const url = getUrlFromEventParameter(event);
    if (!url) {
        return {
            statusCode: 400,
            body: 'URL parameter is required'
        };
    }
    console.log(`Rendering ${url}`);

    const start = new Date();
    const pdfBuffer = await renderPdfFromUrl(url);
    
    if (pdfBuffer === null) {
        return {
            statusCode: 500,
            body: `Failed to render PDF: ${url}`
        };
    }
    const timeToRenderMs = new Date() - start;

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'X-Time-To-Render': `${timeToRenderMs}ms`,
        },
        body: pdfBuffer.toString('utf-8'),
    };
};
