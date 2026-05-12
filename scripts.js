function copyPageUrl() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.querySelector('.copy-page-btn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Скопировано';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

function copyCode(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  navigator.clipboard.writeText(pre.textContent.trim()).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓ Скопировано';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

function copyInline(btn) {
  const code = btn.previousElementSibling;
  if (!code) return;
  navigator.clipboard.writeText(code.textContent.trim()).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓';
    setTimeout(() => btn.textContent = orig, 1500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initTocSpy();
});

function initMobileNav() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const sectionTitle = sidebar.querySelector('.section-title')?.textContent || 'Разделы';
  const navHtml = sidebar.querySelector('.sidebar-nav')?.outerHTML || '';
  if (!navHtml) return;

  const btn = document.createElement('button');
  btn.className = 'mobile-nav-toggle';
  btn.setAttribute('aria-label', 'Открыть меню разделов');
  btn.innerHTML = '<span></span><span></span><span></span>';

  const drawer = document.createElement('div');
  drawer.className = 'mobile-nav-drawer';
  drawer.innerHTML = `
    <div class="mobile-nav-backdrop"></div>
    <aside class="mobile-nav-panel">
      <div class="mobile-nav-head">
        <div class="section-label">Раздел</div>
        <div class="section-title">${sectionTitle}</div>
        <button class="mobile-nav-close" aria-label="Закрыть">✕</button>
      </div>
      ${navHtml}
    </aside>
  `;

  const header = document.querySelector('.site-header');
  header.appendChild(btn);
  document.body.appendChild(drawer);

  const open = () => { document.body.classList.add('mobile-nav-open'); };
  const close = () => { document.body.classList.remove('mobile-nav-open'); };

  btn.addEventListener('click', open);
  drawer.querySelector('.mobile-nav-backdrop').addEventListener('click', close);
  drawer.querySelector('.mobile-nav-close').addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

function initTocSpy() {
  const tocLinks = document.querySelectorAll('.toc a, .sidebar-toc a');
  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (!tocLinks.length || !headings.length) return;

  function updateActive() {
    let current = headings[0].id;
    headings.forEach(h => {
      if (window.scrollY >= h.offsetTop - 100) current = h.id;
    });
    tocLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }

  updateActive();
  window.addEventListener('scroll', updateActive);
  tocLinks.forEach(a => {
    a.addEventListener('click', () => {
      tocLinks.forEach(l => l.classList.remove('active'));
      a.classList.add('active');
    });
  });
}
