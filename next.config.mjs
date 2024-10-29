/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
          'uploadthing.com',
          'utfs.io',
          'img.clerk.com',
          'subdomain',
          'files.stripe.com',
          'https://firstly-regular-tick.ngrok-free.app/'
        ],
    },
    reactStrictMode: false,

};

export default nextConfig;
