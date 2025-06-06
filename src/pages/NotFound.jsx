import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-800 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-primary to-primary-light rounded-2xl flex items-center justify-center"
        >
          <ApperIcon name="AlertTriangle" size={48} className="text-white" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-surface-900 dark:text-surface-50 mb-4">
          404
        </h1>
        
        <p className="text-xl text-surface-600 dark:text-surface-400 mb-8 max-w-md">
          Oops! The page you're looking for seems to have vanished into the task void.
        </p>
        
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 shadow-soft hover:shadow-card"
        >
          <ApperIcon name="Home" size={20} />
          <span>Back to Tasks</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound