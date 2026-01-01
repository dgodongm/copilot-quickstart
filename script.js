// ============================
// TASK MANAGER APPLICATION
// ============================

class TaskManager {
  constructor() {
    // DOM Elements
    this.taskForm = document.getElementById("taskForm");
    this.taskInput = document.getElementById("taskInput");
    this.tasksContainer = document.getElementById("tasksContainer");
    this.clearCompletedBtn = document.getElementById("clearCompletedBtn");
    this.errorMessage = document.getElementById("errorMessage");

    // Stats elements
    this.totalTasksEl = document.getElementById("totalTasks");
    this.completedTasksEl = document.getElementById("completedTasks");
    this.remainingTasksEl = document.getElementById("remainingTasks");

    // Filter buttons
    this.filterButtons = document.querySelectorAll(".filter-btn");

    // Dark mode toggle
    this.darkModeToggle = document.getElementById("darkModeToggle");

    // Tasks storage
    this.tasks = this.loadTasks();

    // Current filter state
    this.currentFilter = "all";

    // Initialize
    this.init();
  }

  // Initialize the application
  init() {
    this.initDarkMode();
    this.attachEventListeners();
    this.render();
  }

  // Attach event listeners
  attachEventListeners() {
    this.taskForm.addEventListener("submit", (e) => {
      const taskText = this.taskInput.value.trim();

      if (!taskText) {
        e.preventDefault();
        this.showError("Please enter a task description");
        return;
      }

      this.handleAddTask(e);
    });
    this.taskInput.addEventListener("input", () => this.clearError());
    this.clearCompletedBtn.addEventListener("click", () =>
      this.handleClearCompleted()
    );

    // Filter button listeners
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleFilterChange(e));
    });

    // Dark mode toggle listener
    this.darkModeToggle.addEventListener("click", () =>
      this.handleDarkModeToggle()
    );
  }

  // Handle adding a new task
  handleAddTask(e) {
    e.preventDefault();

    const taskText = this.taskInput.value.trim();

    // Validation
    if (!taskText) {
      this.showError("Please enter a task description");
      return;
    }

    if (taskText.length > 200) {
      this.showError("Task description must be 200 characters or less");
      return;
    }

    // Create task object
    const task = {
      id: Date.now(),
      text: taskText,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Add to tasks array
    this.tasks.unshift(task);

    // Save and render
    this.saveTasks();
    this.render();

    // Clear input and focus
    this.taskInput.value = "";
    this.taskInput.focus();
  }

  // Handle task completion toggle
  handleToggleComplete(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.render();
    }
  }

  // Handle task deletion
  handleDeleteTask(taskId) {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
    this.saveTasks();
    this.render();
  }

  // Handle clearing completed tasks
  handleClearCompleted() {
    if (confirm("Are you sure you want to delete all completed tasks?")) {
      this.tasks = this.tasks.filter((t) => !t.completed);
      this.saveTasks();
      this.render();
    }
  }

  // Handle filter change
  handleFilterChange(e) {
    const filterValue = e.target.dataset.filter;
    this.currentFilter = filterValue;

    // Update button states
    this.filterButtons.forEach((btn) => {
      if (btn.dataset.filter === filterValue) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    // Re-render with new filter
    this.render();
  }

  // Get filtered tasks based on current filter
  getFilteredTasks() {
    switch (this.currentFilter) {
      case "completed":
        return this.tasks.filter((t) => t.completed);
      case "pending":
        return this.tasks.filter((t) => !t.completed);
      case "all":
      default:
        return this.tasks;
    }
  }

  // Show error message
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add("show");

    // Auto-hide after 5 seconds
    setTimeout(() => this.clearError(), 5000);
  }

  // Clear error message
  clearError() {
    this.errorMessage.textContent = "";
    this.errorMessage.classList.remove("show");
  }

  // Calculate stats
  calculateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const remaining = total - completed;

    return { total, completed, remaining };
  }

  // Update statistics display
  updateStats() {
    const { total, completed, remaining } = this.calculateStats();

    this.totalTasksEl.textContent = total;
    this.completedTasksEl.textContent = completed;
    this.remainingTasksEl.textContent = remaining;

    // Enable/disable clear button
    this.clearCompletedBtn.disabled = completed === 0;
  }

  // Render task list
  renderTasks() {
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      const emptyMessage =
        this.currentFilter === "all"
          ? "No tasks yet. Add one to get started!"
          : `No ${this.currentFilter} tasks.`;

      this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>${emptyMessage}</p>
                </div>
            `;
      return;
    }

    this.tasksContainer.innerHTML = filteredTasks
      .map((task) => this.createTaskElement(task))
      .join("");

    // Attach event listeners to task elements
    this.attachTaskEventListeners();
  }

  // Create task element HTML
  createTaskElement(task) {
    const isCompleted = task.completed ? "completed" : "";

    return `
            <div class="task-item ${isCompleted}" data-task-id="${task.id}">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? "checked" : ""}
                    aria-label="Mark task as complete: ${task.text}"
                >
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button
                        class="delete-btn"
                        aria-label="Delete task: ${task.text}"
                        title="Delete"
                    >
                        ✕
                    </button>
                </div>
            </div>
        `;
  }

  // Attach event listeners to task elements
  attachTaskEventListeners() {
    this.tasksContainer.querySelectorAll(".task-item").forEach((taskEl) => {
      const taskId = parseInt(taskEl.dataset.taskId);

      // Checkbox listener
      const checkbox = taskEl.querySelector(".task-checkbox");
      checkbox.addEventListener("change", () =>
        this.handleToggleComplete(taskId)
      );

      // Delete button listener
      const deleteBtn = taskEl.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => this.handleDeleteTask(taskId));
    });
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Main render function
  render() {
    this.renderTasks();
    this.updateStats();
  }

  // Load tasks from localStorage
  loadTasks() {
    try {
      const saved = localStorage.getItem("tasks");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  // Save tasks to localStorage
  saveTasks() {
    try {
      localStorage.setItem("tasks", JSON.stringify(this.tasks));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  }

  // Initialize dark mode
  initDarkMode() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    // Determine initial theme
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  // Enable dark mode
  enableDarkMode() {
    document.documentElement.classList.add("dark-mode");
    document.documentElement.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
    this.darkModeToggle.setAttribute("aria-label", "Toggle light mode");
    this.darkModeToggle.title = "Toggle light mode";
    this.darkModeToggle.querySelector(".toggle-icon").textContent = "☀️";
  }

  // Disable dark mode
  disableDarkMode() {
    document.documentElement.classList.add("light-mode");
    document.documentElement.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
    this.darkModeToggle.setAttribute("aria-label", "Toggle dark mode");
    this.darkModeToggle.title = "Toggle dark mode";
    this.darkModeToggle.querySelector(".toggle-icon").textContent = "🌙";
  }

  // Handle dark mode toggle
  handleDarkModeToggle() {
    const isDarkMode = document.documentElement.classList.contains("dark-mode");

    if (isDarkMode) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }
}

// ============================
// INITIALIZE APPLICATION
// ============================

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new TaskManager();
  });
} else {
  new TaskManager();
}
