import { chromium, devices } from 'playwright';
const b = await chromium.launch();
for (const [name, port] of [['before', 4400], ['after', 4401]])
  for (const [kind, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', devices['iPhone 14']]]) {
    const p = await (await b.newContext(opts)).newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(e.message));
    p.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await p.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'astro-dev-toolbar{display:none!important}' });
    for (let y = 0; y < await p.evaluate(() => document.body.scrollHeight); y += 400) { await p.mouse.wheel(0, 400); await p.waitForTimeout(80); }
    await p.waitForLoadState('networkidle'); await p.mouse.move(0, 0); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
    require_text: { const fs = await import('node:fs'); fs.writeFileSync(`${name}-${kind}.txt`, await p.evaluate(() => document.body.innerText)); }
    await p.screenshot({ path: `${name}-${kind}.png`, fullPage: true });
    console.log(name, kind, errors.length ? errors : 'no console errors');
  }
await b.close();
