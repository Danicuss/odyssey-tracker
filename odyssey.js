const { chromium } = require("playwright");

const knownDates = new Set([
    "Friday 17 July 2026 00:01",
    "Friday 17 July 2026 20:15",
    "Saturday 18 July 2026 20:20",
    "Sunday 19 July 2026 20:20",
  ]);  

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--disable-blink-features=AutomationControlled"], });


  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    locale: "en-GB",
    timezoneId: "Europe/London",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  await page.goto("https://whatson.bfi.org.uk/imax/Online/default.asp?BOparam::WScontent::loadArticle::article_id=A0A2A7B6-689F-40DA-A1E4-22F7A5B3E99A");

  await page.waitForFunction(() => window.articleContext !== undefined, {
    timeout: 15000,
  });

  const articleContext = await page.evaluate(() => window.articleContext);

  const startDateIdx =
    articleContext.searchNames.indexOf("start_date");

  const currentDates = articleContext.searchResults
    .map(row => row[startDateIdx])
    .filter(Boolean);

  const newDates = [];

  for (const date of currentDates) {
    if (!knownDates.has(date)) {
      knownDates.add(date);   // update in memory
      newDates.push(date);
    }
  }

  console.log(currentDates);

  if (newDates.length > 0) {
    console.log("🚨 NEW DATES FOUND:");
    newDates.forEach(d => console.log("  +", d));
    process.exitCode = 1;
  } else {
    console.log("✅ No new dates");
  }

  await browser.close();
})();




