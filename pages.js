(() => {
  const dialog = document.getElementById('ai-view');
  const open = document.getElementById('ai-open');
  open.addEventListener('click', () => {
    dialog.showModal();
    dialog.classList.add('active');
    open.setAttribute('aria-expanded', 'true');
    const input = document.getElementById('ai-input');
    if (!input.disabled) input.focus();
  });
  document.getElementById('ai-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dialog.classList.remove('active');
    open.setAttribute('aria-expanded', 'false');
  });
})();
