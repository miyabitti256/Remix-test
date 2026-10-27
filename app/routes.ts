import { get, post, route } from 'remix/routes'

export const routes = route({
  home: get('/'),
  health: get('/health'),
  tasksIndex: get('/api/tasks'),
  tasksCreate: post('/api/tasks'),
  taskToggle: post('/api/tasks/:id/toggle'),
  taskDelete: post('/api/tasks/:id/delete'),
  tasksClearCompleted: post('/api/tasks/clear-completed'),
})
