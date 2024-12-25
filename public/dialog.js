document.addEventListener('DOMContentLoaded', () => {
  const dialogs = document.querySelectorAll('dialog')

  for (const dialog of dialogs) {
    dialog.removeAttribute('open')

    dialog.showModal()

    /**
     *  Close dialog clicking on backdrop
     *  the backdrop is considered to be part of the dialog
     *  we check for a click on the dialog and if true calls close on the dialog
     *  This introduces a problem where any click anywhere on the actual dialog
     *  closes the dialog. To resolve that, we cover the entire dialog in elements
     *  and remove padding, so you're never clicking on the dialog except when
     *  clicking the backdrop.
     *
     *  Additionally, if a click starts on the dialog, but ends up on the backdrop
     *  this should not close the dialog. Clicking the backdrop should be a
     *  deliberate action.
     */
    let downTarget
    dialog.addEventListener('mousedown', ({ target }) => {
      downTarget = target
    })

    dialog.addEventListener('mouseup', ({ target }) => {
      if (target === downTarget && target === dialog) {
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

    const textArea = dialog.querySelector('textarea')
    textArea.onkeydown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()

        const form = textArea.getAttribute('form')
        document.querySelector(`#${form}`).submit()
      }
    }
  }
})
