module.exports = {
  apps: [{
    name: "alumniconnect-api",
    cwd: "./backend",
    script: "src/server.js",
    env: { NODE_ENV: "production", PORT: 4000 }
  }]
};
