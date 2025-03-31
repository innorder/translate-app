/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  // Add webpack configuration to fix module resolution issues
  webpack: (config, { isServer }) => {
    // Fix for module resolution issues
    config.resolve.fallback = { ...config.resolve.fallback };

    // Fix for module resolution errors
    config.module = {
      ...config.module,
      exprContextCritical: false,
    };

    // Add additional configuration to fix module not found errors
    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      chunkIds: "deterministic",
      runtimeChunk: isServer ? false : "single",
      splitChunks: isServer
        ? {
            cacheGroups: {
              default: false,
              vendors: false,
            },
          }
        : {
            chunks: "all",
            cacheGroups: {
              default: false,
              vendors: false,
              commons: {
                name: "commons",
                chunks: "all",
                minChunks: 2,
              },
              framework: {
                chunks: "all",
                name: "framework",
                test: /[\\/]node_modules[\\/](@next|next|react|react-dom)[\\/]/,
                priority: 40,
                enforce: true,
              },
              lib: {
                test(module) {
                  return (
                    module.size() > 50000 &&
                    /node_modules[\\/]/.test(module.identifier())
                  );
                },
                name(module) {
                  // Use a simple hash function instead of crypto
                  const str = module.identifier();
                  let hash = 0;
                  for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = (hash << 5) - hash + char;
                    hash = hash & hash; // Convert to 32bit integer
                  }
                  return "lib-" + Math.abs(hash).toString(16).substring(0, 8);
                },
                priority: 30,
                minChunks: 1,
                reuseExistingChunk: true,
              },
            },
          },
    };

    return config;
  },
  // Increase build memory limit
  experimental: {
    esmExternals: "loose",
    // Disable some experimental features that might cause issues
    optimizeCss: false,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
  // Disable static optimization to prevent chunk issues
  poweredByHeader: false,
  reactStrictMode: false,
};

// Re-enable SWC plugins
if (process.env.NEXT_PUBLIC_TEMPO) {
  nextConfig.experimental = {
    ...nextConfig.experimental,
    // NextJS 14.1.3 to 14.2.11:
    swcPlugins: [[require.resolve("tempo-devtools/swc/0.90"), {}]],
  };
}

module.exports = nextConfig;
