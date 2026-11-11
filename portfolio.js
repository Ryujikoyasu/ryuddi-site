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
  let transitionId = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const peek = document.getElementById('work-peek');
  const closePeek = () => { if (peek?.matches(':popover-open')) peek.hidePopover(); };
  const worldForHash = hash => worlds.find(world => `#${world.id}` === hash);
  const render = (hash, focus = false) => {
    closePeek();
    const current = worldForHash(hash);
    overview.hidden = Boolean(current);
    worlds.forEach(world => { world.hidden = world !== current; });
    document.body.classList.toggle('world-open', Boolean(current));
    if (focus) {
      if (current) current.querySelector('h2').focus({ preventScroll: true });
      else (returnTarget || overview.querySelector('[data-garden-link]')).focus({ preventScroll: true });
    }
  };
  // Enter through the selected patch of garden, then let the inner drawing unfold.
  const travel = async (hash, source) => {
    const id = ++transitionId;
    const outgoing = worlds.find(world => !world.hidden) || overview;
    const sourceRect = source.getBoundingClientRect();
    const shellRect = gardenShell.getBoundingClientRect();
    const originX = Math.max(8, Math.min(92, (sourceRect.left + sourceRect.width / 2 - shellRect.left) / shellRect.width * 100));
    const originY = Math.max(8, Math.min(92, (sourceRect.top + sourceRect.height / 2 - shellRect.top) / shellRect.height * 100));
    const origin = `${originX}% ${originY}%`;
    closePeek();
    if (!reducedMotion.matches && outgoing.animate) {
      const leaving = outgoing.animate([
        { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' },
        { opacity: 0, transform: hash === '#garden-overview' ? 'scale(.94)' : 'scale(1.12)', filter: 'blur(2px)' }
      ], { duration: 160, easing: 'ease-in', fill: 'forwards' });
      outgoing.style.transformOrigin = origin;
      await leaving.finished.catch(() => {});
      leaving.cancel();
    }
    if (id !== transitionId) return;
    if (location.hash !== hash) history.pushState(null, '', hash);
    render(hash, true);
    const current = worldForHash(hash);
    const incoming = current || overview;
    if (!reducedMotion.matches && incoming.animate) {
      incoming.animate([
        { opacity: 0, clipPath: `circle(4% at ${origin})` },
        { opacity: 1, clipPath: `circle(150% at ${origin})` }
      ], { duration: 580, easing: 'cubic-bezier(.16,1,.3,1)' });
      const drawing = incoming.querySelector('svg');
      drawing?.animate([
        { transform: 'scale(.88) rotate(-1deg)', opacity: .35 },
        { transform: 'scale(1) rotate(0)', opacity: 1 }
      ], { duration: 700, easing: 'cubic-bezier(.16,1,.3,1)' });
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
      travel(hash, link);
    });
  });
  window.addEventListener('popstate', () => { transitionId++; render(location.hash, true); });
  window.addEventListener('hashchange', () => { transitionId++; render(location.hash, true); });
  document.addEventListener('keydown', event => {
    if (peek?.matches(':popover-open')) return;
    if (event.key === 'Escape' && worldForHash(location.hash)) {
      transitionId++;
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

// A small photograph beside the drawing, with native light-dismiss and Escape.
const photoPeek = document.getElementById('work-peek');
const photoData = document.getElementById('photo-data');
if (photoPeek && photoData && typeof photoPeek.showPopover === 'function') {
  const photos = JSON.parse(photoData.textContent);
  const image = document.getElementById('peek-image');
  const title = document.getElementById('peek-title');
  const detail = document.getElementById('peek-link');
  const closeButton = photoPeek.querySelector('.peek-close');
  let opener = null;
  let currentId = null;
  const placePhoto = () => {
    if (!opener || !photoPeek.matches(':popover-open')) return;
    const rect = opener.getBoundingClientRect();
    const box = photoPeek.getBoundingClientRect();
    const left = Math.max(12, Math.min(window.innerWidth - box.width - 12, rect.left + rect.width / 2 - box.width / 2));
    const above = rect.top - box.height - 12;
    const top = Math.max(12, Math.min(window.innerHeight - box.height - 12, above > 12 ? above : rect.bottom + 12));
    photoPeek.style.left = `${left}px`;
    photoPeek.style.top = `${top}px`;
  };
  document.querySelectorAll('[data-photo-id]').forEach(link => {
    let wasOpen = false;
    link.setAttribute('aria-expanded', 'false');
    link.setAttribute('aria-controls', 'work-peek');
    link.addEventListener('pointerdown', () => { wasOpen = photoPeek.matches(':popover-open') && currentId === link.dataset.photoId; });
    link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const photo = photos[link.dataset.photoId];
      if (!photo) return;
      event.preventDefault();
      if (wasOpen || (event.detail === 0 && photoPeek.matches(':popover-open') && opener === link)) {
        wasOpen = false;
        photoPeek.hidePopover();
        link.focus({ preventScroll: true });
        return;
      }
      document.querySelectorAll('[data-photo-id]').forEach(other => other.setAttribute('aria-expanded', 'false'));
      opener = link;
      currentId = link.dataset.photoId;
      image.src = photo.src;
      image.alt = photo.title;
      title.textContent = photo.title;
      detail.href = photo.url;
      photoPeek.showPopover();
      link.setAttribute('aria-expanded', 'true');
      placePhoto();
      closeButton.focus({ preventScroll: true });
    });
  });
  closeButton.addEventListener('click', () => { photoPeek.hidePopover(); opener?.focus({ preventScroll: true }); });
  photoPeek.addEventListener('toggle', event => {
    if (event.newState === 'closed') document.querySelectorAll('[data-photo-id]').forEach(link => link.setAttribute('aria-expanded', 'false'));
  });
  image.addEventListener('load', placePhoto);
  window.addEventListener('resize', placePhoto);
}
