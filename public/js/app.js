/* global confirm */

import './filter.js'
import './task-dialog.js'
import './info-dialog.js'
import './confirm-dialog.js'

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') {
    e.preventDefault()

    const hasDirtyForm = document.querySelectorAll('[is-dirty="true"]')

    if (hasDirtyForm.length) {
      if (confirm('There are unsaved changes, are you sure?') === true) {
        window.location.href = '/new'
      }
    } else {
      window.location.href = '/new'
    }
  }
})
