const fs = require('fs')
const path = require('path')

const crearCarpeta = (upDir, files) => {

    if (!fs.existsSync(upDir)){
        fs.mkdirSync(upDir, { recursive: true});
    }

    for (const file of Object.values(files)) {
        const tempPath = file.path;
        const targetPath = path.join(upDir, file.name);
        fs.renameSync(tempPath, targetPath);
    }
}

module.exports = crearCarpeta