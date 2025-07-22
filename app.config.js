export default ({ config }) => ({
  ...config,
  android: {
    ...(config.android || {}),
    package: "com.sarran.eyezone"
  },
  ios: {
    ...(config.ios || {}),
    bundleIdentifier: "com.sarran.eyezone"
  },
  extra: {
    ...(config.extra || {})
  }
});
