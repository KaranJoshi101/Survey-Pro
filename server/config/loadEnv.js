const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnvironment(projectRoot) {
  const rootDir = path.resolve(projectRoot);
  const envPaths = process.env.NODE_ENV === 'production'
    ? [path.join(rootDir, '.env.production'), path.join(rootDir, '.env')]
    : [path.join(rootDir, '.env')];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      return envPath;
    }
  }

  dotenv.config();
  return null;
}

module.exports = {
  loadEnvironment,
};