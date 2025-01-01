/* global HTMLElement customElements */

class ConfirmDialog extends HTMLElement {
  constructor () {
    super()

    this.dialog = this.querySelector('dialog')
    this.closeForm = this.querySelector('form#task-dialog-close')
  }

  connectedCallback () {
    this.dialog.removeAttribute('open')
    this.dialog.showModal()

    this.dialog.addEventListener('close', this.handleEvent)

    this.closeForm.addEventListener('submit', e => {
      e.preventDefault()

      this.dialog.close()
    })
  }

  disconnectedCallback() {

  }

  adoptedCallback() {

  }

  attributeChangedCallback() {

  }

  handleEvent (event) {
    const current = window.location.href

    if (current.includes('delete')) {
      window.history.replaceState({}, '', current.replace('/delete/', '/view/'))
    }

    if (current.includes('archive')) {
      window.history.replaceState({}, '', current.replace('/archive/', '/view/'))
    }
  }
}

if (!customElements.get('confirm-dialog')) {
  customElements.define('confirm-dialog', ConfirmDialog)
}
