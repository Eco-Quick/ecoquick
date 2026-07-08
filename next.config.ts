import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Turbopack resolves PostCSS
  // plugins (tailwindcss) from ./node_modules and never walks up to $HOME.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
