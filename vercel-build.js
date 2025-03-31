#!/usr/bin/env node

/**
 * Pre-build script for Vercel deployments
 * This script runs before the build process and helps ensure compatibility
 */

console.log("🚀 Running pre-build checks for Vercel deployment...");

// Check for required environment variables
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_PROJECT_ID",
];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn("⚠️ Warning: The following environment variables are missing:");
  missingVars.forEach((varName) => console.warn(`  - ${varName}`));
  console.warn("These should be configured in your Vercel project settings.");
}

// Modify package.json to use a Vercel-compatible build command
const fs = require("fs");
const path = require("path");

try {
  // Create a production-optimized next.config.js
  const nextConfigPath = path.join(process.cwd(), "next.config.js");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");

  // Create a backup of the original config
  fs.writeFileSync(
    path.join(process.cwd(), "next.config.original.js"),
    nextConfigContent,
    "utf8",
  );

  // Create a simplified version for production
  const simplifiedConfig = `/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // Simplified webpack configuration for production
  webpack: (config) => {
    config.resolve.fallback = { ...config.resolve.fallback };
    return config;
  },
};

module.exports = nextConfig;
`;

  fs.writeFileSync(nextConfigPath, simplifiedConfig, "utf8");
  console.log("✅ Created production-optimized next.config.js");

  console.log("✅ Pre-build checks completed successfully!");
} catch (error) {
  console.error("❌ Error during pre-build checks:", error);
  process.exit(1);
}
