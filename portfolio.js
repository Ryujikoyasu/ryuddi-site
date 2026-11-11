document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(b => {
    const active = b === button;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-category]').forEach(card => {
    card.hidden = value !== 'all' && !card.dataset.category.split(' ').includes(value);
  });
}));

// Native details and anchors keep every theme reachable without JavaScript.
const garden = document.querySelector('.garden-stage');
if (garden) {
  const records = [...document.querySelectorAll('.garden-record')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const recordForHash = hash => records.find(record => `#${record.id}` === hash);
  const openRecord = (record, scroll) => {
    records.forEach(other => {
      if (other !== record) {
        other.open = false;
        other.querySelectorAll('video').forEach(video => video.pause());
      }
    });
    record.open = true;
    if (scroll) record.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  };
  records.forEach(record => { record.open = false; });
  const initial = recordForHash(location.hash);
  if (initial) openRecord(initial, true);
  const showHash = () => {
    const record = recordForHash(location.hash);
    if (record) openRecord(record, true);
  };
  window.addEventListener('hashchange', showHash);
  garden.querySelectorAll('a[href^="#year-"]').forEach(link => {
    link.addEventListener('click', event => {
      const hash = link.getAttribute('href');
      const record = recordForHash(hash);
      if (!record) return;
      event.preventDefault();
      if (location.hash !== hash) history.pushState(null, '', hash);
      openRecord(record, true);
      garden.classList.add('garden-touched');
      // Move keyboard focus to the opened record without another scroll.
      record.querySelector('summary').focus({ preventScroll: true });
    });
  });
  // External text labels and the illustration share the same small responses.
  document.querySelectorAll('[data-garden-link]').forEach(link => {
    const place = garden.querySelector(`.garden-place[href="${link.getAttribute('href')}"]`);
    ['pointerenter', 'focus'].forEach(name => link.addEventListener(name, () => place?.classList.add('is-active')));
    ['pointerleave', 'blur'].forEach(name => link.addEventListener(name, () => place?.classList.remove('is-active')));
  });
  records.forEach(record => record.addEventListener('toggle', () => {
    if (!record.open) record.querySelectorAll('video').forEach(video => video.pause());
  }));
}
