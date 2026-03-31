/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",  // Enable static HTML export
  images: {
    unoptimized: true // required if using Next.js Image component
  }
};

module.exports = nextConfig;
