const path = require("path");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.js", // Your main React entry file
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction ? "[name].[contenthash].js" : "[name].js",
      publicPath: "/",
    },
    resolve: {
      extensions: [".js", ".jsx", ".json"], // File extensions to resolve
      alias: {
        // Define your aliases here
        "@components": path.resolve(__dirname, "src/components/"),
        "@pages": path.resolve(__dirname, "src/pages/"),
        "@assets": path.resolve(__dirname, "src/assets/"),
        "@utils": path.resolve(__dirname, "src/utils/"),
        // Add more aliases as needed
      },
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
        {
          test: /\.svg$/i,
          issuer: /\.(js|jsx|ts|tsx)$/,
          use: [
            {
              loader: "@svgr/webpack",
              options: {
                svgo: false, // Disable SVGO optimization if needed
                titleProp: true,
                ref: true,
              },
            },
          ],
        },
        {
          test: /\.svg$/i,
          type: "asset/resource",
          resourceQuery: /url/, // *.svg?url
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif)$/i,
          type: "asset/resource",
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
        },
      ],
    },
    plugins: [],
    devServer: {
      static: {
        directory: path.join(__dirname, "public"),
      },
      compress: true,
      port: 3000,
      historyApiFallback: true, // Important for React Router
      hot: true,
    },
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  };
};
