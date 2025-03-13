/** @type {import('next').NextConfig} */
const path = require('path');
const dotenv = require('dotenv');

// Load the specific environment file
const envFile = process.env.ENV_FILE || '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile) });

const nextConfig = {
    images: {
        domains: ['myrecipebook-s3-bucket.s3.amazonaws.com'],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Provide fallbacks for Node.js core modules (non-prefixed)
            config.resolve.fallback = {
                ...config.resolve.fallback,
                https: require.resolve('https-browserify'),
                http: require.resolve('stream-http'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                zlib: require.resolve('browserify-zlib'),
                url: require.resolve('url/'),
                // Fallbacks for "node:"-prefixed imports
                'node:https': require.resolve('https-browserify'),
                'node:http': require.resolve('stream-http'),
                'node:crypto': require.resolve('crypto-browserify'),
                'node:stream': require.resolve('stream-browserify'),
                'node:zlib': require.resolve('browserify-zlib'),
                'node:url': require.resolve('url/')
            };

            // Add aliases for "node:"-prefixed imports as well
            config.resolve.alias = {
                ...config.resolve.alias,
                'node:https': require.resolve('https-browserify'),
                'node:http': require.resolve('stream-http'),
                'node:crypto': require.resolve('crypto-browserify'),
                'node:stream': require.resolve('stream-browserify'),
                'node:zlib': require.resolve('browserify-zlib'),
                'node:url': require.resolve('url/')
            };

            // Add a rule to disable fully specified resolution for .js, .ts, .jsx, and .tsx files.
            // This helps webpack handle "node:" imports that otherwise cause the UnhandledSchemeError.
            config.module.rules.push({
                test: /\.[jt]sx?$/,
                resolve: {
                    fullySpecified: false,
                },
            });
        }
        return config;
    },
    swcMinify: true,
    compiler: {
        // Additional compiler options can go here.
    }
};

module.exports = nextConfig;