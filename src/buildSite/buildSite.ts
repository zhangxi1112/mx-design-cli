import webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import getWebpackConfig from "../config/webpackConfig";
import { getProjectPath, getProjectConfig, syncChainFns } from "../utils";
import { IDeployConfig } from "../interface";

import { BUILD_SITE } from "../constants";
export default ({ outDir, analyzer }: IDeployConfig) => {
  const config = syncChainFns(getWebpackConfig, getProjectConfig)(BUILD_SITE);
  config.output.path = getProjectPath(outDir);

  if (analyzer) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        generateStatsFile: true,
      })
    );
  }

  webpack(config).run(() => {});
};
