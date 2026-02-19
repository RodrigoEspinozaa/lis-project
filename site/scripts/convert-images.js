const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const files = ['lis-logo.png','lis-logo-small.png','fleur.png','knot.png','hero-gif.gif'];
const assetsDir = path.join(__dirname,'..','assets');

(async ()=>{
  for(const file of files){
    const input = path.join(assetsDir,file);
    if(!fs.existsSync(input)) { console.warn('No existe:',input); continue }
    const base = path.parse(file).name;
    try{
      // WebP
      await sharp(input, {animated: true}).webp({quality:80,lossless:false}).toFile(path.join(assetsDir, base + '.webp'));
      // AVIF
      await sharp(input, {animated: true}).avif({quality:50}).toFile(path.join(assetsDir, base + '.avif'));
      console.log('Converted:', file);
    }catch(err){ console.error('Error converting',file,err.message) }
  }
})();