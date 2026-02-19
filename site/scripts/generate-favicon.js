const sharp = require('sharp');
const path = require('path');
const inFile = path.join(__dirname,'..','assets','lis-logo-small.png');
const outFile = path.join(__dirname,'..','assets','favicon.png');
sharp(inFile).resize(64,64).png().toFile(outFile).then(()=>console.log('favicon.png created')).catch(e=>console.error(e));