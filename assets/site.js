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
function selectScreenshot(tab, focus = false) {
  screenshotTabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
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
  display.querySelector('img').src = source;
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
