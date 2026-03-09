const fs = require('fs');

// Extract base64 from index.html LOGO variable
const idx = fs.readFileSync('C:/Users/Sheil/Downloads/DEALERPOST NEW WS/index.html', 'utf8');
const match = idx.match(/var LOGO = '(data:image[^']*)'/);
if (!match) { console.log('LOGO not found'); process.exit(1); }
const logoDataUrl = match[1];
console.log('Logo data URL length:', logoDataUrl.length);

const pages = ['index.html', 'pricing.html', 'faq.html', 'terms.html', 'privacy.html'];
pages.forEach(function(p) {
  const path = 'C:/Users/Sheil/Downloads/DEALERPOST NEW WS/' + p;
  let pg = fs.readFileSync(path, 'utf8');

  // Replace ALL logo img src values (both old path variants) with the base64 data URL
  let updated = pg
    .replace(/src="DEALERPOSTLOGO\.jpeg"/g, 'src="' + logoDataUrl + '"')
    .replace(/src="\.\.\/DEALERPOST PHOTOS\/DEALERPOSTLOGO\.jpeg"/g, 'src="' + logoDataUrl + '"');

  fs.writeFileSync(path, updated, 'utf8');
  const prefix = logoDataUrl.substring(0, 20);
  const count = (updated.split(prefix).length - 1);
  console.log(p + ': updated (' + count + ' logo srcs)');
});
