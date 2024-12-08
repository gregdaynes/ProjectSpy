document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.querySelector('dialog');
  dialog.removeAttribute('open');

  dialog.showModal();

  dialog.addEventListener('click', ({ target }) => {
    if (target === dialog) {
      dialog.close();
      window.history.replaceState({}, '', '/');
    }
  });
});
