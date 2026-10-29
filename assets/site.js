const menu = document.querySelector('.menu-toggle');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.querySelector('.nav-links').classList.toggle('open', open);
});
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false');
  document.querySelector('.nav-links').classList.remove('open');
}));

// The gallery switches between captures of production SwiftUI views.
const screenshotTabs = [...document.querySelectorAll('.screen-tabs [role="tab"]')];
const screenPanels = document.querySelector('.screen-panels');
const tabStrip = document.querySelector('.screen-tabs');
const motionOK = matchMedia('(prefers-reduced-motion: no-preference)');
let tabIndicator;
if (tabStrip) {
  tabIndicator = document.createElement('span');
  tabIndicator.className = 'tab-indicator';
  tabIndicator.setAttribute('aria-hidden', 'true');
  tabStrip.append(tabIndicator);
  tabStrip.classList.add('has-indicator');
}
function placeTabIndicator() {
  const selected = tabStrip?.querySelector('[aria-selected="true"]');
  if (!selected) return;
  tabIndicator.style.left = `${selected.offsetLeft}px`;
  tabIndicator.style.width = `${selected.offsetWidth}px`;
}
placeTabIndicator();
addEventListener('resize', placeTabIndicator);
document.fonts?.ready.then(placeTabIndicator);
function selectScreenshot(tab, focus = false) {
  const from = screenshotTabs.findIndex(item => item.getAttribute('aria-selected') === 'true');
  const to = screenshotTabs.indexOf(tab);
  if (screenPanels && from !== to) {
    // Slide in from the side the reader moved toward (mirrored for RTL).
    const rtl = document.documentElement.dir === 'rtl';
    screenPanels.style.setProperty('--sm-dir', (to > from) !== rtl ? 1 : -1);
    screenPanels.classList.remove('is-switching');
    void screenPanels.offsetWidth;
    screenPanels.classList.add('is-switching');
  }
  screenshotTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
  placeTabIndicator();
}
screenshotTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectScreenshot(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % screenshotTabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + screenshotTabs.length) % screenshotTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = screenshotTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectScreenshot(screenshotTabs[next], true);
      screenshotTabs[next].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  });
});
document.querySelectorAll('[data-jump-screen]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(`tab-${link.dataset.jumpScreen}`);
  if (target) selectScreenshot(target);
}));
document.querySelectorAll('[data-appearance]').forEach(button => button.addEventListener('click', () => {
  const panel = button.closest('.screen-panel');
  const display = panel.querySelector('.screen-display');
  const locale = document.documentElement.lang;
  const source = `/assets/screens/${display.dataset.screenshot}-${button.dataset.appearance}-${locale}.webp`;
  const img = display.querySelector('img');
  const device = display.querySelector('.gallery-device');
  if (motionOK.matches && device && !img.src.endsWith(source)) {
    // Fade the screen out, swap once the other appearance has loaded, fade back in.
    device.classList.add('is-swapping');
    const next = new Image();
    next.onload = next.onerror = () => setTimeout(() => {
      img.src = source;
      requestAnimationFrame(() => device.classList.remove('is-swapping'));
    }, 160);
    next.src = source;
  } else {
    img.src = source;
  }
  panel.querySelector('[data-zoom]').dataset.zoom = source;
  panel.querySelectorAll('[data-appearance]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
const screenshotDialog = document.querySelector('.screenshot-dialog');
document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
  const img = screenshotDialog.querySelector('.dialog-scroll img');
  img.src = button.dataset.zoom;
  img.alt = `${button.dataset.zoomAlt} — ShiftMoon`;
  screenshotDialog.showModal();
  screenshotDialog.querySelector('.dialog-scroll').scrollTop = 0;
}));
screenshotDialog?.querySelector('.dialog-close').addEventListener('click', () => screenshotDialog.close());
screenshotDialog?.addEventListener('click', event => {
  if (event.target === screenshotDialog) screenshotDialog.close();
});
// Language picker: close on outside click or Escape.
const languageMenu = document.querySelector('.lang-menu');
document.addEventListener('click', event => {
  if (languageMenu?.open && !languageMenu.contains(event.target)) languageMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (languageMenu?.open) { languageMenu.open = false; languageMenu.querySelector('summary').focus(); }
  if (menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    document.querySelector('.nav-links').classList.remove('open');
    menu.focus();
  }
});

// Scroll motion: each tracked block gets its progress as CSS variables
// (--in, --p, --out; see header.css). One rAF per scroll, transforms only.
const scrollBlocks = [
  ['.product-hero', 'out'],
  ['.calendar-evidence', 'in'], ['.earnings-evidence', 'in'], ['.screen-panels', 'in'],
  ['.widget-gallery', 'in'], ['.pricing', 'in'], ['.last-call', 'p'],
].flatMap(([selector, kind]) => [...document.querySelectorAll(selector)].map(element => ({ element, kind })));
if (motionOK.matches && scrollBlocks.length) {
  const clamp = value => Math.min(1, Math.max(0, value));
  let queued = false;
  const update = () => {
    queued = false;
    const viewport = innerHeight;
    for (const { element, kind } of scrollBlocks) {
      const box = element.getBoundingClientRect();
      if (box.bottom < -viewport || box.top > viewport * 2) continue;
      if (kind === 'out') element.style.setProperty('--out', clamp(-box.top / Math.max(1, box.height * .9)).toFixed(4));
      if (kind === 'in') element.style.setProperty('--in', clamp((viewport - box.top) / (viewport * .7)).toFixed(4));
      if (kind === 'p') element.style.setProperty('--p', clamp((viewport - box.top) / (viewport + box.height)).toFixed(4));
    }
  };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  update();
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
}

// Headings with a hand-placed break: balance each part on its own, so
// "A clearer working / month." becomes "A clearer / working month."
document.querySelectorAll('main h1, main h2').forEach(heading => {
  if (!heading.querySelector('br')) return;
  const parts = [[]];
  [...heading.childNodes].forEach(node => node.nodeName === 'BR' ? parts.push([]) : parts[parts.length - 1].push(node));
  heading.replaceChildren(...parts.map(nodes => {
    const line = document.createElement('span');
    line.className = 'hl';
    line.append(...nodes);
    return line;
  }));
});

// Polish, Ukrainian and Russian typography: a one-letter word (w, i, z, в, і, у…)
// never ends a line; it stays with the word after it.
if (/^(pl|uk|ru)$/.test(document.documentElement.lang)) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: node => node.parentElement.closest('script,style,code,pre') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
  });
  const oneLetter = /(^|[\s(«„"])([a-zA-Zа-яА-ЯіІїЇєЄґҐ])\s+(?=\S)/g;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (oneLetter.test(node.data)) node.data = node.data.replace(oneLetter, '$1$2 ');
    oneLetter.lastIndex = 0;
  }
}
