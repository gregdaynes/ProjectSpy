document.addEventListener('DOMContentLoaded', () => {
  const template = document.querySelector('#task-filter')
  const appHeader = document.querySelector('application-header')
  const tasks = document.querySelectorAll('task-l')

  let filterData = document.getElementById('search-data')?.textContent
  if (!filterData) return
  filterData = JSON.parse(filterData)

  const content = template.content.cloneNode(true)
  const button = content.querySelector('button')
  const field = content.querySelector('input')

  button.addEventListener('click', () => {
    field.focus()
  })

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault()

      field.focus()
    }
  })

  field.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()

      field.value = ''
      tasks.forEach(task => task.classList.remove('hidden'))
      document.activeElement.blur()
    }
  })

  field.addEventListener('input', (e) => {
    if (e.target.value === '') {
      tasks.forEach(task => task.classList.remove('hidden'))
      return
    }

    const results = filterData.filter(([entry]) => {
      return entry.includes(e.target.value.toLowerCase())
    }).map(([, id]) => id)

    for (const task of tasks) {
      const id = task.getAttribute('id')

      if (!results.includes(id)) {
        task.classList.add('hidden')
      } else {
        task.classList.remove('hidden')

        const taskHeader = task.querySelector('task-header')
        const taskBody = task.querySelector('task-body')

        if (!task.hasAttribute('data-header-original')) {
          task.setAttribute('data-header-original', taskHeader.innerHTML)
        }

        if (!task.hasAttribute('data-body-original')) {
          task.setAttribute('data-body-original', taskBody.innerHTML)
        }

        const regex = new RegExp(e.target.value, 'ig')
        taskHeader.innerHTML = task.getAttribute('data-header-original').replace(regex, '<mark>$&</mark>')
        taskBody.innerHTML = task.getAttribute('data-body-original').replace(regex, '<mark>$&</mark>')
      }
    }
  })

  appHeader.appendChild(content)
})
