const cron = require('node-cron');
const logger = require('./logger');

class Scheduler {
  constructor() {
    this.tasks = new Map();
  }

  // Add a scheduled task
  addTask(name, cronExpression, callback) {
    if (this.tasks.has(name)) {
      logger.warn(`Task ${name} already exists, updating...`);
      this.removeTask(name);
    }

    const task = cron.schedule(cronExpression, async () => {
      logger.info(`Running scheduled task: ${name}`);
      try {
        await callback();
        logger.info(`Task ${name} completed successfully`);
      } catch (error) {
        logger.error(`Task ${name} failed:`, error);
      }
    });

    this.tasks.set(name, task);
    logger.info(`Task ${name} scheduled with expression: ${cronExpression}`);
  }

  // Remove a scheduled task
  removeTask(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      this.tasks.delete(name);
      logger.info(`Task ${name} removed`);
    }
  }

  // Start a paused task
  startTask(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.start();
      logger.info(`Task ${name} started`);
    }
  }

  // Stop a running task
  stopTask(name) {
    const task = this.tasks.get(name);
    if (task) {
      task.stop();
      logger.info(`Task ${name} stopped`);
    }
  }

  // Get all tasks
  getTasks() {
    return Array.from(this.tasks.keys());
  }

  // Initialize default scheduled tasks
  initDefaultTasks() {
    // Example: Health check cleanup every day at midnight
    this.addTask('cleanup', '0 0 * * *', async () => {
      logger.info('Running daily cleanup...');
      // Add cleanup logic here
    });

    // Example: System health check every hour
    this.addTask('health-check', '0 * * * *', async () => {
      logger.info('Running hourly health check...');
      // Add health check logic here
    });
  }
}

module.exports = new Scheduler();
