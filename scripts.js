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
  initMobileProgressBar();
  initTocSpy();
});

function initMobileProgressBar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const links = Array.from(sidebar.querySelectorAll('.sidebar-nav a'));
  if (!links.length) return;

  const filename = window.location.pathname.split('/').pop() || 'index.html';
  let currentIdx = links.findIndex(a => a.getAttribute('href') === filename);
  if (currentIdx === -1) currentIdx = 0;

  const current = links[currentIdx];
  const currentNum = current.querySelector('.num')?.textContent || String(currentIdx + 1);
  const currentTitle = current.textContent.replace(currentNum, '').trim();
  const total = links.length;
  const progress = Math.round(((currentIdx + 1) / total) * 100);

  const navHtml = sidebar.querySelector('.sidebar-nav').outerHTML;

  const bar = document.createElement('div');
  bar.className = 'mobile-progress-bar';
  bar.innerHTML = `
    <button class="mobile-progress-trigger" aria-expanded="false">
      <span class="mobile-progress-count">${currentIdx + 1} / ${total}</span>
      <span class="mobile-progress-title">${currentTitle}</span>
      <span class="mobile-progress-chevron">▾</span>
    </button>
    <div class="mobile-progress-fill" style="width:${progress}%"></div>
    <div class="mobile-progress-panel">
      ${navHtml}
    </div>
  `;

  document.body.appendChild(bar);

  const trigger = bar.querySelector('.mobile-progress-trigger');
  const close = () => {
    bar.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
  };
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = bar.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!bar.contains(e.target)) close();
  });
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
