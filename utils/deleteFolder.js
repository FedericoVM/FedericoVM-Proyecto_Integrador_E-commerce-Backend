const fs = require('fs')
const path = require('path')

const eliminarCarpetaFiles = (file) => {
    if (fs.existsSync(file)){
        fs.readdirSync(file).forEach((e)=>{
            const currentPath = path.join(file,e);
            if(fs.lstatSync(currentPath).isDirectory()){
                eliminarCarpetaFiles(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });
        fs.rmdirSync(file)
    }
}

module.exports = eliminarCarpetaFiles