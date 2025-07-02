import puppeteer from "puppeteer";

export async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,/*
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote'],*/
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
  printBackground: true,
  margin: {
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px'
  }
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
