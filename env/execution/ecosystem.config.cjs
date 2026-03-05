const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return env;
}

module.exports = {
  "apps": [
    {
      "name": "docs",
      "script": "bash",
      "args": "-c \"pnpm dev\"",
      "cwd": "/Users/the_dusky/code/sandbox/capacitr/apps/docs",
      "env": loadEnvFile("/Users/the_dusky/code/sandbox/capacitr/apps/docs/.env.default"),
      "watch": false,
      "autorestart": true,
      "max_restarts": 3
    },
    {
      "name": "sim",
      "script": "bash",
      "args": "-c \"pnpm dev\"",
      "cwd": "/Users/the_dusky/code/sandbox/capacitr/apps/sim",
      "env": loadEnvFile("/Users/the_dusky/code/sandbox/capacitr/apps/sim/.env.default"),
      "watch": false,
      "autorestart": true,
      "max_restarts": 3
    }
  ]
};
