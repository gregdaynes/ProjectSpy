document.addEventListener('DOMContentLoaded', () => {
  const template = document.querySelector('#task-filter')
  const appHeader = document.querySelector('application-header')
  const tasks = document.querySelectorAll('task-l')

  for (const task of tasks) {
    const taskHeader = task.querySelector('task-header')
    const taskBody = task.querySelector('task-body')

    task.setAttribute('data-header-original', encodeURIComponent(taskHeader.innerHTML))
    task.setAttribute('data-body-original', encodeURIComponent(taskBody.innerHTML))
  }

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

  field.addEventListener('keyup', (e) => handleFilterChange(e.target.value))
  field.addEventListener('input', (e) => handleFilterChange(e.target.value))

  const storedFilter = window.sessionStorage.getItem('filter')
  if (storedFilter) {
    handleFilterChange(storedFilter)
    field.value = storedFilter
  }

  function handleFilterChange (value = '') {
    window.sessionStorage.setItem('filter', value)

    if (value === '') {
      tasks.forEach(task => {
        task.classList.remove('hidden')
        highlight(task, value)
      })
      return
    }

    const results = filterData.filter(([entry]) => {
      return entry.includes(value.toLowerCase())
    }).map(([, id]) => id)

    for (const task of tasks) {
      const id = task.getAttribute('id')

      if (!results.includes(id)) {
        task.classList.add('hidden')
      } else {
        task.classList.remove('hidden')
        highlight(task, value)
      }
    }
  }

  function highlight (task, str) {
    const taskHeader = task.querySelector('task-header')
    const taskBody = task.querySelector('task-body')

    const regex = new RegExp(str + '(?![^<]*>)', 'ig')
    taskHeader.innerHTML = decodeURIComponent(task.getAttribute('data-header-original')).replace(regex, '<mark>$&</mark>')
    taskBody.innerHTML = decodeURIComponent(task.getAttribute('data-body-original')).replace(regex, '<mark>$&</mark>')
  }

  appHeader.appendChild(content)
})
