/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "8001",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: "http://localhost:8001/api/:path*",
            },
        ];
    },
};

module.exports = nextConfig;
