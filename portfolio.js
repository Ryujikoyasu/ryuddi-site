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

// Switch between the whole garden and its inner worlds in the same place.
// Anchors and :target provide a complete fallback without JavaScript.
const gardenShell = document.querySelector('.garden-shell');
if (gardenShell) {
  const overview = document.querySelector('.garden-overview');
  const worlds = [...document.querySelectorAll('.garden-world')];
  const garden = document.querySelector('.garden-stage');
  let returnTarget = null;
  const worldForHash = hash => worlds.find(world => `#${world.id}` === hash);
  const render = (hash, focus = false) => {
    const current = worldForHash(hash);
    overview.hidden = Boolean(current);
    worlds.forEach(world => { world.hidden = world !== current; });
    document.body.classList.toggle('world-open', Boolean(current));
    if (focus) {
      if (current) current.querySelector('h2').focus({ preventScroll: true });
      else (returnTarget || overview.querySelector('[data-garden-link]')).focus({ preventScroll: true });
    }
  };
  gardenShell.classList.add('is-enhanced');
  render(location.hash);
  gardenShell.querySelectorAll('a[href^="#year-"], [data-garden-back]').forEach(link => {
    link.addEventListener('click', event => {
      // Preserve modified clicks and opening a link in a new tab.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = link.getAttribute('href');
      if (!worldForHash(hash) && hash !== '#garden-overview') return;
      event.preventDefault();
      if (link.closest('.garden-overview')) returnTarget = link;
      if (location.hash !== hash) history.pushState(null, '', hash);
      render(hash, true);
    });
  });
  window.addEventListener('popstate', () => render(location.hash, true));
  window.addEventListener('hashchange', () => render(location.hash, true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && worldForHash(location.hash)) {
      history.pushState(null, '', '#garden-overview');
      render('#garden-overview', true);
    }
  });
  document.querySelectorAll('[data-garden-link]').forEach(link => {
    const place = garden.querySelector(`.garden-place[href="${link.getAttribute('href')}"]`);
    ['pointerenter', 'focus'].forEach(name => link.addEventListener(name, () => place?.classList.add('is-active')));
    ['pointerleave', 'blur'].forEach(name => link.addEventListener(name, () => place?.classList.remove('is-active')));
  });
}
