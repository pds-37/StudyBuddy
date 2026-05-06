const Jimp = require('jimp');

Jimp.read('d:/Projects/Personal Notes AI/frontend/public/brand/studybuddy-logo.png')
  .then(img => {
    const height = img.bitmap.height;
    // Crop a square from the left side (the sphere)
    img.crop(0, 0, height, height);
    
    img.write('d:/Projects/Personal Notes AI/frontend/public/favicon.png');
    
    // Resize for smaller favicons
    img.clone().resize(16, 16).write('d:/Projects/Personal Notes AI/frontend/public/favicon-16x16.png');
    img.clone().resize(32, 32).write('d:/Projects/Personal Notes AI/frontend/public/favicon-32x32.png');
    img.clone().resize(180, 180).write('d:/Projects/Personal Notes AI/frontend/public/apple-touch-icon.png');
    
    console.log("Done generating favicons!");
  })
  .catch(err => {
    console.error(err);
  });
