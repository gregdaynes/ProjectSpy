/* global confirm */
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
        if (dialog.getAttribute('is-dirty')) {
          if (confirm('There are unsaved changes, are you sure?') === true) {
            dialog.close()
          }
        } else {
          dialog.close()
        }
      }

      downTarget = null
    })

    const inputs = dialog.querySelectorAll('input[type="text"], textarea, select')
    for (const input of inputs) {
      input.addEventListener('change', (e) => {
        dialog.setAttribute('is-dirty', true)
      })

      input.addEventListener('keyup', (e) => {
        if (e.key === 'Control') return
        if (e.key === 'n') return

        dialog.setAttribute('is-dirty', true)
      })
    }

    dialog.onkeydown = (e) => {
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault()

        if (dialog.getAttribute('is-dirty')) {
          if (confirm('There are unsaved changes, are you sure?') === true) {
            dialog.close()
          }
        } else {
          dialog.close()
        }
      }
    }

    dialog.addEventListener('close', (e) => {
      if (e.target.classList.contains('confirm')) {
        const current = window.location.href

        if (current.includes('delete')) {
          window.history.replaceState({}, '', current.replace('/delete/', '/view/'))
        }

        if (current.includes('archive')) {
          window.history.replaceState({}, '', current.replace('/archive/', '/view/'))
        }
      } else {
        window.history.replaceState({}, '', '/')
      }

      dialog.remove()
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

  document.onkeydown = (e) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault()

      document.getElementById('filter-input').focus()
    }

    if (e.ctrlKey && e.key === 'n') {
      console.log('test')
      e.preventDefault()

      const hasDirtyForm = document.querySelectorAll('[is-dirty="true"]')
      console.log(hasDirtyForm)

      if (hasDirtyForm.length) {
        if (confirm('There are unsaved changes, are you sure?') === true) {
          window.location.href = '/new'
        }
      } else {
        window.location.href = '/new'
      }
    }
  }

  document.getElementById('filter-button').addEventListener('click', (e) => {
    document.getElementById('filter-input').focus()
  })

  let data = document.getElementById('search-data')
  if (data) {
    data = JSON.parse(data.textContent)
  }

  const filterField = document.getElementById('filter-input')
  if (filterField) {
    const tasks = document.querySelectorAll('.task')

    filterField.addEventListener('keyup', (e) => {
      if (e.target.value === '') {
        tasks.forEach(task => task.classList.remove('hidden'))
        return
      }

      const results = data.filter(([entry, id]) => {
        return entry.includes(e.target.value)
      }).map(([entry, id]) => id)

      for (const task of tasks) {
        const id = task.getAttribute('id')

        if (!results.includes(id)) {
          task.classList.add('hidden')
        } else {
          task.classList.remove('hidden')
        }
      }
    })
  }
})
