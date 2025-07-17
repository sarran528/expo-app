export default ({ config }) => ({
  ...config,
  android: {
    ...(config.android || {}),
    package: "com.sarran.boltexponativewind"
  },
  extra: {
    ...(config.extra || {}),
    eas: {
      projectId: "ec7a2e19-5f18-47d5-839d-f6dc51388066"
    }
  }
}); 