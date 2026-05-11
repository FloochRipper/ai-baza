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
  initMobileInlineNav();
  initTocSpy();
});

function initMobileInlineNav() {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.layout > main');
  if (!sidebar || !main) return;

  const sectionTitle = sidebar.querySelector('.section-title')?.textContent || 'Разделы';
  const navEl = sidebar.querySelector('.sidebar-nav');
  if (!navEl) return;

  const total = navEl.querySelectorAll('a').length;

  const details = document.createElement('details');
  details.className = 'mobile-inline-nav';
  details.innerHTML = `
    <summary>
      <span class="mobile-inline-label">Все разделы: ${sectionTitle}</span>
      <span class="mobile-inline-count">${total}</span>
    </summary>
    <div class="mobile-inline-body">
      ${navEl.outerHTML}
    </div>
  `;

  main.insertBefore(details, main.firstChild);
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
