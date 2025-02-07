export default {
  presets: [
    [
      require.resolve("@babel/preset-env"),
      {
        modules: false,
      },
    ],
    require.resolve("@babel/preset-react"),
    require.resolve("@babel/preset-typescript"),
  ],
  plugins: [
    [
      require.resolve("@babel/plugin-transform-runtime"),
      { useESModules: true },
    ],
    [require.resolve("@babel/plugin-proposal-decorators"), { legacy: true }],
    [require.resolve("@babel/plugin-proposal-class-properties")],
    require.resolve("@babel/plugin-proposal-optional-chaining"),
  ],
};
