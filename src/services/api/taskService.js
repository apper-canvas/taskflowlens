import taskData from '../mockData/task.json'

class TaskService {
  constructor() {
    this.tasks = [...taskData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.tasks]
  }

  async getById(id) {
    await this.delay()
    const task = this.tasks.find(t => t.id === id)
    return task ? { ...task } : null
  }

  async create(taskData) {
    await this.delay()
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    this.tasks.push(newTask)
    return { ...newTask }
  }

  async update(id, updates) {
    await this.delay()
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')
    
    this.tasks[index] = { ...this.tasks[index], ...updates }
    return { ...this.tasks[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.tasks.findIndex(t => t.id === id)
    if (index === -1) throw new Error('Task not found')
    
    this.tasks.splice(index, 1)
    return true
  }
}

export default new TaskService()