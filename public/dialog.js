document.addEventListener('DOMContentLoaded', () => {
  const dialogs = document.querySelectorAll('dialog')

  for (const dialog of dialogs) {
    dialog.removeAttribute('open')

    dialog.showModal()

    dialog.addEventListener('click', ({ target }) => {
      if (target === dialog) {
        dialog.close()
      }
    })

    dialog.addEventListener('close', (e) => {
      if (e.target.classList.contains('confirm')) {
        const current = window.location.href
        window.history.replaceState({}, '', current.replace('/delete/', '/view/'))
      } else {
        window.history.replaceState({}, '', '/')
      }
    })
  }
})
