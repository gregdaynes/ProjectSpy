document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.querySelector('dialog');
  dialog.removeAttribute('open');

  dialog.showModal();

  dialog.addEventListener('click', ({ target }) => {
    if (target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener('close', () => {
    window.history.replaceState({}, '', '/');
  });
});
