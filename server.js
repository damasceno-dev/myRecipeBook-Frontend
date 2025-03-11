require('dotenv').config({ path: process.env.ENV_FILE || '.env.local' });

if (process.env.NEXTAUTH_URL && process.env.NEXT_PUBLIC_API_URL) {
    console.log('Environment variables loaded correctly.');
} else {
    console.error('Some environment variables are missing. Please check your .env file.');
}


const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const options = {
    key: fs.readFileSync(path.join(__dirname, './certs/localhost+2-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, './certs/localhost+2.pem'))
};
const agressive = true;

app.prepare().then(() => {
    createServer(options, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on https://localhost:3000');
    });
});