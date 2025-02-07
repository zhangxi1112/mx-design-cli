import MiniCssExtractPlugin from "mini-css-extract-plugin";
import ReactRefreshPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import webpackMerge from "webpack-merge";
import WebpackBar from "webpackbar";
import webpack, { Configuration, RuleSetRule, RuleSetUseItem } from "webpack";
import babelConfig from "./babelConfig/es";
import { DEV, BUILD_LIB, BUILD_SITE } from "../constants";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin"; // 压缩css插件
import TerserPlugin from "terser-webpack-plugin"; // 压缩代码
import { IWebpackConfigType } from "../interface";

const baseConfig: Configuration = {
  output: {
    filename: "js/[name].js",
    chunkFilename: "js/[name].[chunkhash:8].js",
    assetModuleFilename: "asset/[name].[contenthash:8].[ext]",
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        reactBase: {
          name: "reactBase",
          chunks: "all",
          test: /[\\/]node_modules[\\/](react|react-dom|@hot-loader|react-router|react-redux|react-router-dom)[\\/]/,
        },
        "async-commons": {
          // 异步加载公共包、组件等
          name: "async-commons",
          chunks: "async",
          test: /[\\/]node_modules[\\/]/,
          minChunks: 2,
          priority: 1,
        },
        default: {
          name: "default",
          priority: -20,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          "thread-loader",
          {
            loader: require.resolve("babel-loader"),
            options: babelConfig,
          },
        ],
      },
      {
        test: /\.(less)$/,
        use: [
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: require.resolve("postcss-loader"),
            options: {
              plugins: [
                require("postcss-flexbugs-fixes"),
                require("postcss-preset-env")({
                  autoprefixer: {
                    flexbox: "no-2009",
                  },
                  stage: 3,
                }),
              ],
            },
          },
          {
            loader: "less-loader",
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024,
          },
        },
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2?)$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [" ", ".ts", ".tsx", ".js", ".jsx", ".less", ".svg"],
  },
  plugins: [new WebpackBar({})],
};

const getBuildConfig = (): Configuration => {
  let config: Configuration = webpackMerge(baseConfig, {
    mode: "production",
    devtool: "hidden-source-map",
    output: {
      filename: "js/[name].js",
      chunkFilename: "js/[name].[chunkhash:8].js",
      publicPath: "./",
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "stylesheet/[name].[contenthash:8].css",
        chunkFilename: "stylesheet/[id].[contenthash:8].css",
      }),
    ],
  });

  ((config.module.rules[1] as RuleSetRule).use as RuleSetUseItem[]).unshift({
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: "../",
    },
  });

  config.optimization.minimizer = [
    // 压缩js文件
    new TerserPlugin({
      // 开启“多线程”，提高压缩效率
      parallel: true,
      exclude: /node_modules/,
    }),
    // 压缩css插件
    new CssMinimizerPlugin({
      minimizerOptions: {
        preset: [
          "default",
          {
            discardComments: { removeAll: true },
          },
        ],
      },
    }),
  ];
  return config;
};

const getDevConfig = (): Configuration => {
  let config = webpackMerge(baseConfig, {
    mode: "development",
    devtool: "eval-cheap-source-map",
    output: {
      publicPath: "/",
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new ReactRefreshPlugin(),
    ],
    optimization: {
      minimize: false,
    },
    cache: {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
    },
  });

  (config.module.rules[0] as RuleSetRule).use[1].options.plugins.push(
    require.resolve("react-refresh/babel")
  );
  ((config.module.rules[1] as RuleSetRule).use as RuleSetUseItem[]).unshift(
    "style-loader"
  );
  return config;
};

const getWebpackConfig = (type?: IWebpackConfigType): Configuration => {
  switch (type) {
    case DEV:
      return getDevConfig();

    case BUILD_SITE:
      return getBuildConfig();

    case BUILD_LIB:
      return getBuildConfig();

    default:
      return getDevConfig();
  }
};

export default getWebpackConfig;
