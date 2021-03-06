const fs = require('fs');
const puppeteer = require('puppeteer');

const formatCurrency = (amount) => {
  return `${(Math.round(amount * 100) / 100).toFixed(2)}`;
}

const generatePdf = async (url) => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0' });

  const buffer = await page.pdf({ format: 'A4' });

  await browser.close();
  
  return buffer;
}

const getData = (configPath) => {
  const data = JSON.parse(fs.readFileSync(configPath));

  const totals = data.items.map(item => {
    return item.hours * item.rate * (1 - item.discount / 100);
  });
  const subTotal = totals.reduce((a, b) => a + b);

  data.subTotal = formatCurrency(subTotal);
  data.gst = data.gstIncluded ? 'Included' : formatCurrency(subTotal * 0.1);
  data.total = data.gstIncluded ? formatCurrency(subTotal) : formatCurrency(subTotal * 1.1);
  data.items.forEach((item, index) => {
    item.total = formatCurrency(totals[index]);
  });

  return data;
}

module.exports = { generatePdf, getData };