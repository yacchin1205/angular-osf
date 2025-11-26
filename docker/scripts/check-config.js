const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../src/assets/config/config.json');
const templatePath = path.join(__dirname, '../../src/assets/config/template.json');

const overrides = [
  { env: 'OSF_URL', key: 'webUrl' },
  { env: 'OSF_API_URL', key: 'apiDomainUrl' },
  { env: 'OSF_CAS_URL', key: 'casUrl' },
];

const configExists = fs.existsSync(configPath);

if (!configExists) {
  console.log('[INFO] config.json not found. Copying from template.json...');
  fs.copyFileSync(templatePath, configPath);

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('[ERROR] Failed to read config.json', error);
    process.exit(1);
  }

  let updated = false;
  for (const { env, key } of overrides) {
    const value = process.env[env];
    if (value) {
      if (config[key] !== value) {
        config[key] = value;
        updated = true;
      }
    }
  }

  if (updated) {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('[INFO] Applied environment overrides to config.json');
  } else {
    console.log('[INFO] No environment overrides applied to config.json');
  }
} else {
  console.log('[INFO] config.json already exists. Skipping environment overrides.');
}
