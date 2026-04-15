// Запускается в фоне. Открывает видимый Chrome на aizdec.me.
// Никита логинится через Telegram. Когда готов - говорит в чат,
// Claude создаёт файл GO_SCRAPE в этой папке, скрипт это видит,
// идёт на целевую страницу, выдёргивает текст в handoff.md и закрывается.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://www.aizdec.me/courses/tuning-claude-code/handoff';
const LOGIN_URL = 'https://www.aizdec.me/';
const AUTH_FILE = path.join(__dirname, 'auth.json');
const OUTPUT_FILE = path.join(__dirname, 'handoff.md');
const HTML_FILE = path.join(__dirname, 'handoff.html');
const GO_SIGNAL = path.join(__dirname, 'GO_SCRAPE');
const STATUS_FILE = path.join(__dirname, 'STATUS.log');
const MAX_WAIT_MINUTES = 15;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(STATUS_FILE, line);
  process.stdout.write(line);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  fs.writeFileSync(STATUS_FILE, '');
  if (fs.existsSync(GO_SIGNAL)) fs.unlinkSync(GO_SIGNAL);

  const hasAuth = fs.existsSync(AUTH_FILE);
  log(hasAuth ? 'Нашёл auth.json, запускаю с сохранённой сессией' : 'Запускаю свежую сессию (надо будет залогиниться)');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(hasAuth ? { storageState: AUTH_FILE } : {});
  const page = await context.newPage();

  log(`Открываю ${LOGIN_URL}`);
  await page.goto(LOGIN_URL);

  log(`Жду сигнал-файл GO_SCRAPE (макс ${MAX_WAIT_MINUTES} мин)`);
  const deadline = Date.now() + MAX_WAIT_MINUTES * 60 * 1000;
  while (!fs.existsSync(GO_SIGNAL)) {
    if (Date.now() > deadline) {
      log('Таймаут. Закрываю браузер');
      await browser.close();
      process.exit(2);
    }
    await sleep(1500);
  }
  log('Получил GO_SCRAPE, сохраняю сессию');

  await context.storageState({ path: AUTH_FILE });

  log(`Иду на ${TARGET_URL}`);
  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    log(`Networkidle не дождался, пробую domcontentloaded: ${e.message}`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForTimeout(3000);

  const title = await page.title();
  const url = page.url();
  log(`Страница: ${title} (${url})`);

  const content = await page.evaluate(() => {
    const main = document.querySelector('main') || document.querySelector('article') || document.body;
    main.querySelectorAll('script, style, noscript').forEach(el => el.remove());
    return main.innerText;
  });

  const html = await page.content();

  const md = `# ${title}\n\n> Источник: ${url}\n> Сохранено: ${new Date().toISOString()}\n\n---\n\n${content}\n`;
  fs.writeFileSync(OUTPUT_FILE, md);
  fs.writeFileSync(HTML_FILE, html);

  log(`Сохранил ${OUTPUT_FILE} (${content.length} символов) и ${HTML_FILE}`);
  log('Закрываю браузер через 3 сек');
  await page.waitForTimeout(3000);
  await browser.close();

  fs.unlinkSync(GO_SIGNAL);
  log('ГОТОВО');
})().catch(err => {
  log(`ОШИБКА: ${err.stack || err.message}`);
  process.exit(1);
});
