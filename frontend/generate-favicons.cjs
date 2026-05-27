const { Jimp } = require('jimp');

// Use the new favicon source provided by the user
const sourceImage = 'd:/Projects/Personal Notes AI/frontend/public/brand/studybuddy-favicon-512.png';

Jimp.read(sourceImage)
  .then(img => {
    // It's already square, so just write it
    img.write('d:/Projects/Personal Notes AI/frontend/public/favicon.png');
    
    // Resize for smaller favicons
    img.clone().resize({ w: 16, h: 16 }).write('d:/Projects/Personal Notes AI/frontend/public/favicon-16x16.png');
    img.clone().resize({ w: 32, h: 32 }).write('d:/Projects/Personal Notes AI/frontend/public/favicon-32x32.png');
    img.clone().resize({ w: 180, h: 180 }).write('d:/Projects/Personal Notes AI/frontend/public/apple-touch-icon.png');
    
    console.log("Done updating favicons from new source!");
  })
  .catch(err => {
    console.error("Error generating favicons:", err);
  });
