// Expo loads this entry point when a consumer adds '@rapide-om/expo-tracelet'
// to their app.config.js plugins array. The compiled plugin lives at
// plugin/build/index.js — `bun run build:plugin` regenerates it from src/.
module.exports = require('./plugin/build');
