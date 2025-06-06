import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'
import taskService from '../services/api/taskService'
import categoryService from '../services/api/categoryService'
import { format, isToday, isThisWeek, isPast } from 'date-fns'

const Home = ({ darkMode, setDarkMode }) => {
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [view, setView] = useState('all') // all, today, week
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState([])
  const [draggedTask, setDraggedTask] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tasksData, categoriesData] = await Promise.all([
        taskService.getAll(),
        categoryService.getAll()
      ])
      setTasks(tasksData || [])
      setCategories(categoriesData || [])
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || task?.category === selectedCategory
    
    let matchesView = true
    if (view === 'today') {
      matchesView = task?.dueDate ? isToday(new Date(task.dueDate)) : false
    } else if (view === 'week') {
      matchesView = task?.dueDate ? isThisWeek(new Date(task.dueDate)) : false
    }
    
    return matchesSearch && matchesCategory && matchesView
  })

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task?.status === 'todo'),
    inProgress: filteredTasks.filter(task => task?.status === 'inProgress'),
    done: filteredTasks.filter(task => task?.status === 'done')
  }

  const handleTaskCreate = async (taskData) => {
    try {
      const newTask = await taskService.create({
        ...taskData,
        status: 'todo',
        createdAt: new Date().toISOString()
      })
      setTasks(prev => [...prev, newTask])
      setShowAddForm(false)
      toast.success("Task created successfully")
    } catch (err) {
      toast.error("Failed to create task")
    }
  }

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const updatedTask = await taskService.update(taskId, updates)
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      toast.success("Task updated successfully")
    } catch (err) {
      toast.error("Failed to update task")
    }
  }

  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.delete(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      toast.success("Task deleted successfully")
    } catch (err) {
      toast.error("Failed to delete task")
    }
  }

  const handleBulkAction = async (action) => {
    try {
      if (action === 'complete') {
        for (const taskId of selectedTasks) {
          await taskService.update(taskId, { 
            status: 'done',
            completedAt: new Date().toISOString()
          })
        }
        toast.success(`${selectedTasks.length} tasks completed`)
      } else if (action === 'delete') {
        for (const taskId of selectedTasks) {
          await taskService.delete(taskId)
        }
        toast.success(`${selectedTasks.length} tasks deleted`)
      }
      await loadData()
      setSelectedTasks([])
    } catch (err) {
      toast.error("Failed to perform bulk action")
    }
  }

  const handleDragStart = (task) => {
    setDraggedTask(task)
  }

  const handleDrop = async (status) => {
    if (draggedTask && draggedTask.status !== status) {
      await handleTaskUpdate(draggedTask.id, { 
        status,
        ...(status === 'done' ? { completedAt: new Date().toISOString() } : {})
      })
    }
    setDraggedTask(null)
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-400'
    }
  }

  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: 'Uncategorized', color: '#6b7280' }
  }

  const getTaskCounts = () => {
    const today = tasks.filter(task => task?.dueDate && isToday(new Date(task.dueDate))).length
    const week = tasks.filter(task => task?.dueDate && isThisWeek(new Date(task.dueDate))).length
    const overdue = tasks.filter(task => task?.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done').length
    
    return { today, week, overdue, total: tasks.length }
  }

  const counts = getTaskCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800">
      {/* Header */}
      <header className="glass border-b border-surface-200 dark:border-surface-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
                  <ApperIcon name="CheckSquare" size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-heading font-bold text-surface-900 dark:text-surface-50">
                  TaskFlow
                </h1>
              </motion.div>

              {/* Stats */}
              <div className="hidden lg:flex items-center space-x-6 ml-8">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {counts.today} Today
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {counts.week} This Week
                  </span>
                </div>
                {counts.overdue > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {counts.overdue} Overdue
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <ApperIcon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All', icon: 'List' },
                  { key: 'today', label: 'Today', icon: 'Calendar' },
                  { key: 'week', label: 'Week', icon: 'CalendarDays' }
                ].map((viewOption) => (
                  <button
                    key={viewOption.key}
                    onClick={() => setView(viewOption.key)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      view === viewOption.key
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                    }`}
                  >
                    <ApperIcon name={viewOption.icon} size={14} />
                    <span className="hidden sm:inline">{viewOption.label}</span>
                  </button>
                ))}
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors duration-200"
              >
                <ApperIcon name={darkMode ? "Sun" : "Moon"} size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-64 space-y-4"
          >
            {/* Categories */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white'
                      : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Inbox" size={16} />
                    <span className="text-sm">All Tasks</span>
                  </div>
                  <span className="text-xs">{tasks.length}</span>
                </button>
                
                {categories.map((category) => {
                  const categoryTasks = tasks.filter(task => task?.category === category.id)
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-xs">{categoryTasks.length}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600 dark:text-surface-400">Completed</span>
                  <span className="text-sm font-medium">
                    {tasksByStatus.done.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600 dark:text-surface-400">In Progress</span>
                  <span className="text-sm font-medium">
                    {tasksByStatus.inProgress.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-surface-600 dark:text-surface-400">Todo</span>
                  <span className="text-sm font-medium">
                    {tasksByStatus.todo.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Bulk Actions */}
            <AnimatePresence>
              {selectedTasks.length > 0 && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="glass rounded-xl p-4 mb-6 border border-primary/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedTasks.length} tasks selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBulkAction('complete')}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors duration-200"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setSelectedTasks([])}
                        className="px-3 py-1.5 bg-surface-500 text-white text-sm rounded-lg hover:bg-surface-600 transition-colors duration-200"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Feature Component */}
            <MainFeature
              tasks={filteredTasks}
              tasksByStatus={tasksByStatus}
              categories={categories}
              onTaskCreate={handleTaskCreate}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
              selectedTasks={selectedTasks}
              setSelectedTasks={setSelectedTasks}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              getPriorityColor={getPriorityColor}
              getCategoryById={getCategoryById}
              draggedTask={draggedTask}
            />
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-primary-light text-white rounded-full shadow-neu-light dark:shadow-neu-dark flex items-center justify-center z-50"
      >
        <ApperIcon name="Plus" size={24} />
      </motion.button>
    </div>
  )
}

export default Home