'use strict';
const chromium = require('chrome-aws-lambda');
const base64 = require('base-64');
const utf8 = require('utf8');
const { v4 } = require('uuid');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");

function getUrlParamFromEventParameter(event) {
    if (event.queryStringParameters && event.queryStringParameters['url']) {
        return event.queryStringParameters['url'];
    }
    return '';
}

function getReturnParamFromEventParameter(event) {
    let retval = null;
    if (event.queryStringParameters && event.queryStringParameters['return']) {
        retval = event.queryStringParameters['return'];
    }
    if (retval != 'url') {
        return 'pdf';
    }
    return 'url';
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

async function uploadPdfToS3(pdf) {
    const client = new S3Client({
        apiVersion: '2006-03-01',
    });
    const bucket = process.env.TEMP_BUCKET_NAME;
    const key = `${v4()}.pdf`;
    console.log(`Uploading to: s3://${bucket}/${key}`);

    const putCommand = new PutObjectCommand({
        Body: pdf,
        Bucket: bucket,
        Key: key,
        ContentType: 'application/pdf'
    });

    await client.send(putCommand);
    
    const getCommand = new GetObjectCommand({ 
        Bucket: bucket,
        Key: key,
    });

    const url = await getSignedUrl(client, getCommand, { expiresIn: 3600 });

    return url;
}

exports.handler = async (event, context) => {
    const url = getUrlParamFromEventParameter(event);
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

    const returnType = getReturnParamFromEventParameter(event);

    if (returnType == 'pdf') {
        return {
            statusCode: 200,
            isBase64Encoded: true,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Length': pdfBuffer.length,
                'X-Time-To-Render': `${timeToRenderMs}ms`,
            },
            body: pdfBuffer.toString('base64'),
        };
    } else if (returnType == 'url') {
        const tempFileUrl = await uploadPdfToS3(pdfBuffer);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'X-Time-To-Render': `${timeToRenderMs}ms`,
            },
            body: {
                url: tempFileUrl,
            }
        };
    }
    return {
        statusCode: 400,
        body: 'Parameter error'
    };
};
