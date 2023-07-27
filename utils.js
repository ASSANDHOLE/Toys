// Check if Syntax is OK

const fs = require('fs');
const path = require('path');

const _loadProjectConfig = () => {
    const config_path = path.join(__dirname, 'config', 'config.json');
    return JSON.parse(fs.readFileSync(config_path, 'utf8'));
}

const projectConfig = _loadProjectConfig();
Object.freeze(projectConfig);

// export all the functions
module.exports = {
    projectConfig,
}
