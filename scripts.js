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

document.addEventListener('DOMContentLoaded', () => {
  const tocLinks = document.querySelectorAll('.toc a');
  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (!tocLinks.length || !headings.length) return;

  window.addEventListener('scroll', () => {
    let current = '';
    headings.forEach(h => {
      if (window.scrollY >= h.offsetTop - 90) current = h.id;
    });
    tocLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  });
});
