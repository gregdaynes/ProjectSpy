/* global confirm HTMLElement customElements */

class TaskDialog extends HTMLElement {
  constructor () {
    super()

    this.dialog = this.querySelector('dialog')
    this.closeForm = this.querySelector('form#task-dialog-close')
    this.inputs = this.querySelectorAll('input[type="text"], textarea, select')
    this.textarea = this.querySelector('textarea')
    this.downTarget = null
  }

  connectedCallback () {
    this.controller = new AbortController()
    const signal = this.controller.signal

    this.dialog.removeAttribute('open')
    this.dialog.showModal()

    this.dialog.addEventListener('close', this.handleEvent, { signal })
    this.dialog.addEventListener('mousedown', this.handleEvent.bind(this), { signal })
    this.dialog.addEventListener('mouseup', this.handleEvent.bind(this), { signal })
    this.dialog.addEventListener('keydown', this.handleEvent.bind(this), { signal })

    for (const input of this.inputs) {
      input.addEventListener('change', () => {
        this.dialog.setAttribute('is-dirty', true)
      }, { signal })

      input.addEventListener('keyup', (e) => {
        if (e.ctrlKey && e.key === 'n') return

        this.dialog.setAttribute('is-dirty', true)
      }, { signal })
    }

    this.closeForm.addEventListener('submit', e => {
      e.preventDefault()

      this.dialog.close()
    }, { signal })
  }

  disconnectedCallback () {
    this.controller.signal.abort()
  }

  adoptedCallback () { }

  attributeChangedCallback () { }

  handleEvent (event) {
    if (event.type === 'close') {
      window.history.replaceState({}, '', '/')
    }

    if (event.type === 'mousedown') {
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
      this.downTarget = event.target
    }

    if (event.type === 'mouseup') {
      if (event.target === this.downTarget && event.target === this.dialog) {
        if (this.dialog.getAttribute('is-dirty')) {
          if (confirm('There are unsaved changes, are you sure?') === true) {
            this.dialog.close()
          }
        } else {
          this.dialog.close()
        }
      }

      this.downtarget = null
    }

    if (event.ctrlKey && event.key === 'w') {
      event.preventDefault()

      if (this.dialog.getAttribute('is-dirty')) {
        if (confirm('There are unsaved changes, are you sure?') === true) {
          this.dialog.close()
        }
      } else {
        this.dialog.close()
      }
    }

    if (event.ctrlKey && event.key === 's') {
      event.preventDefault()

      const form = this.textarea.getAttribute('form')
      this.querySelector(`#${form}`).submit()
    }
  }
}

if (!customElements.get('task-dialog')) {
  customElements.define('task-dialog', TaskDialog)
}
