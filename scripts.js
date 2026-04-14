function toggle(header) {
  const body = header.nextElementSibling;
  const willOpen = !header.classList.contains('open');
  header.classList.toggle('open');
  body.classList.toggle('open');
  header.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function copy(btn) {
  const code = btn.previousElementSibling.innerText;
  navigator.clipboard.writeText(code).then(() => {
    const old = btn.innerText;
    btn.innerText = 'СКОПИРОВАНО';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerText = old; btn.classList.remove('copied'); }, 1500);
  });
}

function copyRow(row) {
  const text = row.querySelector('.cmd-text').innerText;
  const copyEl = row.querySelector('.cmd-copy');
  navigator.clipboard.writeText(text).then(() => {
    const old = copyEl.innerText;
    copyEl.innerText = 'Скопировано';
    row.classList.add('copied');
    setTimeout(() => { copyEl.innerText = old; row.classList.remove('copied'); }, 1500);
  });
}

// === Set aria-expanded initially on all section headers ===
document.querySelectorAll('.section-header').forEach(h => {
  h.setAttribute('aria-expanded', h.classList.contains('open') ? 'true' : 'false');
  h.setAttribute('role', 'button');
  h.setAttribute('tabindex', '0');
  h.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(h); }
  });
});

// === Deep linking ===
function openFromHash() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;
  const target = document.getElementById(hash);
  if (!target) return;
  const header = target.querySelector(':scope > .section-header');
  if (header && !header.classList.contains('open')) {
    header.classList.add('open');
    header.nextElementSibling.classList.add('open');
    header.setAttribute('aria-expanded', 'true');
  }
  const parentSection = target.closest('.section');
  if (parentSection && parentSection !== target) {
    const ph = parentSection.querySelector(':scope > .section-header');
    if (ph && !ph.classList.contains('open')) {
      ph.classList.add('open');
      ph.nextElementSibling.classList.add('open');
      ph.setAttribute('aria-expanded', 'true');
    }
  }
  setTimeout(() => target.scrollIntoView({behavior: 'smooth', block: 'start'}), 100);
}
window.addEventListener('load', openFromHash);
window.addEventListener('hashchange', openFromHash);

// === Sticky TOC: highlight current section ===
const tocLinks = document.querySelectorAll('.toc-link');
const tocMap = new Map();
tocLinks.forEach(l => {
  const id = l.getAttribute('href').substring(1);
  const el = document.getElementById(id);
  if (el) tocMap.set(el, l);
});
if (tocMap.size && 'IntersectionObserver' in window) {
  const visible = new Set();
  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) visible.add(e.target);
      else visible.delete(e.target);
    });
    if (visible.size) {
      const top = [...visible].sort((a,b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
      tocLinks.forEach(l => l.classList.remove('active'));
      const link = tocMap.get(top);
      if (link) link.classList.add('active');
    }
  }, { rootMargin: '-80px 0px -65% 0px', threshold: 0 });
  tocMap.forEach((_, el) => tocObserver.observe(el));
}

// === Burger / Mobile panel ===
function toggleBurger() {
  const burger = document.getElementById('burgerBtn');
  const panel = document.getElementById('mobilePanel');
  const overlay = document.getElementById('mobileOverlay');
  if (!burger || !panel || !overlay) return;
  const isOpen = panel.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// === Expand/Collapse all ===
function toggleAll() {
  const headers = document.querySelectorAll('.section-header');
  const anyClosed = Array.from(headers).some(h => !h.classList.contains('open'));
  headers.forEach(h => {
    if (anyClosed) {
      h.classList.add('open');
      h.nextElementSibling.classList.add('open');
      h.setAttribute('aria-expanded', 'true');
    } else {
      h.classList.remove('open');
      h.nextElementSibling.classList.remove('open');
      h.setAttribute('aria-expanded', 'false');
    }
  });
  const btn = document.getElementById('toggleAllBtn');
  const mobileBtn = document.getElementById('mobileToggleAll');
  const label = anyClosed ? 'Свернуть всё' : 'Раскрыть всё';
  if (btn) btn.querySelector('.tool-btn-label').textContent = label;
  if (mobileBtn) mobileBtn.textContent = label;
}

// === Search: filter sections + highlight ===
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');
const allSections = Array.from(document.querySelectorAll('.section'));
const allDividers = Array.from(document.querySelectorAll('.block-divider'));

const sectionData = allSections.map(sec => ({
  el: sec,
  header: sec.querySelector('.section-name'),
  body: sec.querySelector('.section-body'),
  origHeader: sec.querySelector('.section-name') ? sec.querySelector('.section-name').innerHTML : '',
  origBody: sec.querySelector('.section-body') ? sec.querySelector('.section-body').innerHTML : '',
  text: ((sec.querySelector('.section-name') ? sec.querySelector('.section-name').innerText : '') + ' ' +
         (sec.querySelector('.section-body') ? sec.querySelector('.section-body').innerText : '')).toLowerCase()
}));

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function highlight(html, query) {
  if (!query) return html;
  const re = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
  return html.replace(/(>[^<]+)/g, (chunk) => chunk.replace(re, '<mark class="search-hit">$1</mark>'));
}

let searchTimer;
function applySearch() {
  const query = (searchInput.value || '').trim().toLowerCase();
  let visibleCount = 0;

  sectionData.forEach(s => {
    if (!query) {
      s.el.classList.remove('search-hidden');
      if (s.header) s.header.innerHTML = s.origHeader;
      if (s.body) s.body.innerHTML = s.origBody;
      visibleCount++;
    } else if (s.text.includes(query)) {
      s.el.classList.remove('search-hidden');
      if (s.header) s.header.innerHTML = highlight(s.origHeader, query);
      if (s.body) s.body.innerHTML = highlight(s.origBody, query);
      const h = s.el.querySelector('.section-header');
      if (h && !h.classList.contains('open')) {
        h.classList.add('open');
        h.nextElementSibling.classList.add('open');
        h.setAttribute('aria-expanded', 'true');
      }
      visibleCount++;
    } else {
      s.el.classList.add('search-hidden');
    }
  });

  if (query) {
    allDividers.forEach(div => {
      let next = div.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains('block-divider')) {
        if (next.classList.contains('section') && !next.classList.contains('search-hidden')) {
          hasVisible = true; break;
        }
        next = next.nextElementSibling;
      }
      div.classList.toggle('search-hidden', !hasVisible);
    });
  } else {
    allDividers.forEach(div => div.classList.remove('search-hidden'));
  }

  if (noResults) noResults.classList.toggle('show', !!query && visibleCount === 0);
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearch, 80);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape' && document.activeElement === searchInput) {
      clearSearch();
      searchInput.blur();
    }
  });
}

function clearSearch() {
  if (!searchInput) return;
  searchInput.value = '';
  applySearch();
  searchInput.focus();
}

// === Active nav highlighting (for current page) ===
(function markActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page], .mobile-panel a[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === path) {
      link.classList.add('active');
    }
  });
})();

// Close mobile panel on hash change
window.addEventListener('hashchange', () => {
  const panel = document.getElementById('mobilePanel');
  if (panel && panel.classList.contains('open')) toggleBurger();
});
