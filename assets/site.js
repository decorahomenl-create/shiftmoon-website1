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
const isUk = document.documentElement.lang === 'uk';
const rotations = {
  rotating: [0, 0, 1, 1, 2, 2, 3],
  weekdays: [0, 0, 0, 0, 0, 3, 3],
  nights: [2, 2, 2, 3, 3, 2, 2]
};
const shifts = isUk ? ['Ранок', 'Вечір', 'Ніч', 'Вихідний'] : ['Morning', 'Evening', 'Night', 'Day off'];
const times = ['06:00–14:00', '14:00–22:00', '22:00–06:00', '—'];
const symbols = ['☀', '◒', '☾', '↗'];
const demo = document.querySelector('.week-demo');
document.querySelectorAll('[data-pattern]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-pattern]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  rotations[button.dataset.pattern].forEach((shift, i) => {
    const cell = demo.querySelectorAll('.day')[i];
    cell.dataset.shift = shift;
    cell.querySelector('.shift-symbol').textContent = symbols[shift];
    cell.querySelector('.shift-name').textContent = shifts[shift];
    cell.querySelector('.shift-time').textContent = times[shift];
  });
  document.querySelector('.demo-status').textContent = isUk ? 'Приклад графіка оновлено.' : 'Example schedule updated.';
}));
