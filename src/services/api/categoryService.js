import categoryData from '../mockData/category.json'

class CategoryService {
  constructor() {
    this.categories = [...categoryData]
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300))
  }

  async getAll() {
    await this.delay()
    return [...this.categories]
  }

  async getById(id) {
    await this.delay()
    const category = this.categories.find(c => c.id === id)
    return category ? { ...category } : null
  }

  async create(categoryData) {
    await this.delay()
    const newCategory = {
      ...categoryData,
      id: Date.now().toString(),
      taskCount: 0
    }
    this.categories.push(newCategory)
    return { ...newCategory }
  }

  async update(id, updates) {
    await this.delay()
    const index = this.categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Category not found')
    
    this.categories[index] = { ...this.categories[index], ...updates }
    return { ...this.categories[index] }
  }

  async delete(id) {
    await this.delay()
    const index = this.categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Category not found')
    
    this.categories.splice(index, 1)
    return true
  }
}

export default new CategoryService()