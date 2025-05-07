import puppeteer from "puppeteer";
import { config } from "dotenv"

config();

export async function generatePDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/opt/chrome/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote'],
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0",
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
