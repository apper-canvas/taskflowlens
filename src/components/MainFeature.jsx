import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from './ApperIcon'
import { format, isPast, isToday, isTomorrow } from 'date-fns'

const MainFeature = ({ 
  tasks, 
  tasksByStatus, 
  categories, 
  onTaskCreate, 
  onTaskUpdate, 
  onTaskDelete,
  onDragStart,
  onDrop,
  selectedTasks,
  setSelectedTasks,
  showAddForm,
  setShowAddForm,
  getPriorityColor,
  getCategoryById,
  draggedTask
}) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    dueDate: ''
  })
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // kanban or list

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      await onTaskCreate(newTask)
      setNewTask({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        dueDate: ''
      })
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleTaskEdit = async (taskId, field, value) => {
    try {
      await onTaskUpdate(taskId, { [field]: value })
      setEditingTask(null)
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const formatDueDate = (dueDate) => {
    if (!dueDate) return ''
    const date = new Date(dueDate)
    
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isPast(date)) return 'Overdue'
    
    return format(date, 'MMM dd')
  }

  const getDueDateColor = (dueDate, status) => {
    if (!dueDate || status === 'done') return 'text-surface-500'
    const date = new Date(dueDate)
    
    if (isPast(date)) return 'text-red-500'
    if (isToday(date)) return 'text-amber-500'
    
    return 'text-surface-600 dark:text-surface-400'
  }

  const TaskCard = ({ task, showCheckbox = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      draggable
      onDragStart={() => onDragStart(task)}
      className={`glass rounded-xl p-4 border cursor-move transition-all duration-200 ${
        selectedTasks.includes(task.id)
          ? 'border-primary bg-primary/5'
          : 'border-surface-200 dark:border-surface-700 hover:border-primary/30'
      } ${task.status === 'done' ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={selectedTasks.includes(task.id)}
            onChange={() => handleTaskToggle(task.id)}
            className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingTask === task.id ? (
                <input
                  type="text"
                  defaultValue={task.title}
                  onBlur={(e) => handleTaskEdit(task.id, 'title', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTaskEdit(task.id, 'title', e.target.value)
                    }
                  }}
                  className="w-full bg-transparent border-b border-primary focus:outline-none"
                  autoFocus
                />
              ) : (
                <h3 
                  className={`font-medium cursor-pointer ${
                    task.status === 'done' ? 'line-through text-surface-500' : ''
                  }`}
                  onClick={() => setEditingTask(task.id)}
                >
                  {task.title}
                </h3>
              )}
              
              {task.description && (
                <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center space-x-3 mt-3">
                {task.category && (
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryById(task.category).color }}
                    />
                    <span className="text-xs text-surface-600 dark:text-surface-400">
                      {getCategoryById(task.category).name}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                  <span className="text-xs text-surface-600 dark:text-surface-400 capitalize">
                    {task.priority}
                  </span>
                </div>
                
                {task.dueDate && (
                  <span className={`text-xs ${getDueDateColor(task.dueDate, task.status)}`}>
                    {formatDueDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTaskUpdate(task.id, { 
                    status: task.status === 'done' ? 'todo' : 'done',
                    ...(task.status !== 'done' ? { completedAt: new Date().toISOString() } : {})
                  })
                }}
                className={`p-1 rounded transition-colors duration-200 ${
                  task.status === 'done'
                    ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                    : 'text-surface-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
              >
                <ApperIcon name="Check" size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onTaskDelete(task.id)
                }}
                className="p-1 rounded text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <ApperIcon name="Trash2" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const KanbanColumn = ({ status, title, tasks, color }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-surface-900 dark:text-surface-100">
            {title}
          </h3>
          <span className="text-sm text-surface-500 bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div
        className={`space-y-3 min-h-[400px] p-3 rounded-xl border-2 border-dashed transition-colors duration-200 ${
          draggedTask && draggedTask.status !== status
            ? 'border-primary bg-primary/5'
            : 'border-surface-200 dark:border-surface-700'
        }`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDrop(status)}
      >
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <div className="text-center py-12">
            <ApperIcon name="Plus" size={32} className="mx-auto text-surface-300 dark:text-surface-600 mb-2" />
            <p className="text-surface-400 dark:text-surface-500 text-sm">
              {status === 'todo' ? 'No pending tasks' : 
               status === 'inProgress' ? 'No tasks in progress' : 
               'No completed tasks'}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-surface-900 dark:text-surface-100">
          Tasks
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
              }`}
            >
              <ApperIcon name="Columns" size={14} />
              <span>Kanban</span>
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
              }`}
            >
              <ApperIcon name="List" size={14} />
              <span>List</span>
            </button>
          </div>
          
          {viewMode === 'list' && (
            <button
              onClick={() => {
                const allTaskIds = tasks.map(t => t.id)
                setSelectedTasks(
                  selectedTasks.length === allTaskIds.length ? [] : allTaskIds
                )
              }}
              className="px-3 py-1.5 text-sm bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors duration-200"
            >
              {selectedTasks.length === tasks.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-xl p-6 border border-primary/20"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter task title"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-3 py-2 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 shadow-soft"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Display */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <KanbanColumn 
            status="todo" 
            title="To Do" 
            tasks={tasksByStatus.todo} 
            color="bg-blue-500"
          />
          <KanbanColumn 
            status="inProgress" 
            title="In Progress" 
            tasks={tasksByStatus.inProgress} 
            color="bg-amber-500"
          />
          <KanbanColumn 
            status="done" 
            title="Done" 
            tasks={tasksByStatus.done} 
            color="bg-green-500"
          />
        </div>
      ) : (
        <div className="glass rounded-xl p-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary to-primary-light rounded-2xl flex items-center justify-center"
              >
                <ApperIcon name="CheckCircle" size={32} className="text-white" />
              </motion.div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2">
                No tasks yet
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-4">
                Create your first task to get started with TaskFlow
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="Plus" size={16} />
                <span>Add Task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} showCheckbox={true} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MainFeature