/**
 * TaskList Web Component
 *
 * Container for displaying a list of tasks.
 *
 * @fires task-empty - Emitted when task list is empty
 * @fires task-toggle - Emitted when task completion status is toggled
 * @fires task-edit - Emitted when task edit is requested
 * @fires task-delete - Emitted when task deletion is requested
 */
export class TaskList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._tasks = [];
    this._editingTaskId = null;
    this._activeFilter = 'all'; // 'all', 'completed', 'pending'
  }

  set tasks(tasks) {
    this._tasks = tasks || [];
    // Reset active filter when tasks change
    if (this._activeFilter !== 'all' && this._tasks.length === 0) {
      this._activeFilter = 'all';
    }
    this.render();
  }

  get tasks() {
    return this._tasks;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this._tasks || this._tasks.length === 0) {
      this.renderEmpty();
      this.attachEvents();
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary-50: #f5f3ff;
          --primary-100: #ede9fe;
          --primary-200: #ddd6fe;
          --primary-300: #c4b5fd;
          --primary-400: #a78bfa;
          --primary-500: #8b5cf6;
          --primary-600: #7c3aed;
          --primary-700: #6d28d9;
          
          --success-50: #f0fdf4;
          --success-500: #22c55e;
          --success-600: #16a34a;
          
          --warning-50: #fffbeb;
          --warning-500: #f59e0b;
          --warning-600: #d97706;
          
          --danger-50: #fef2f2;
          --danger-500: #ef4444;
          --danger-600: #dc2626;
          
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          
          --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .task-list {
          display: flex;
          flex-direction: column;
          background: white;
          overflow: hidden;
        }

        .stats {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
          border-bottom: 1px solid var(--gray-200);
          font-size: 0.875rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-left {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          background: white;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--transition-base);
          user-select: none;
          font-weight: 500;
          color: var(--gray-600);
          border: 1px solid var(--gray-200);
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-item.completed {
          color: var(--success-600);
        }

        .stat-item.completed:hover {
          background: linear-gradient(135deg, var(--success-50) 0%, var(--success-50) 100%);
          border-color: var(--success-500);
        }

        .stat-item.completed.active {
          background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          border-color: transparent;
        }

        .stat-item.pending {
          color: var(--warning-600);
        }

        .stat-item.pending:hover {
          background: linear-gradient(135deg, var(--warning-50) 0%, var(--warning-50) 100%);
          border-color: var(--warning-500);
        }

        .stat-item.pending.active {
          background: linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          border-color: transparent;
        }

        .stat-item.all {
          color: var(--primary-600);
        }

        .stat-item.all:hover {
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-50) 100%);
          border-color: var(--primary-400);
        }

        .stat-item.all.active {
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
          border-color: transparent;
        }

        /* Task Item Styles */
        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--gray-100);
          transition: all var(--transition-base);
          background: white;
          position: relative;
          overflow: hidden;
        }

        .task-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--gray-300);
          transition: all var(--transition-base);
        }

        .task-item.HIGH::before {
          background: linear-gradient(180deg, var(--danger-500) 0%, var(--danger-600) 100%);
        }

        .task-item.MEDIUM::before {
          background: linear-gradient(180deg, var(--warning-500) 0%, var(--warning-600) 100%);
        }

        .task-item.LOW::before {
          background: linear-gradient(180deg, var(--success-500) 0%, var(--success-600) 100%);
        }

        .task-item:hover {
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
          box-shadow: inset 0 0 0 1px var(--gray-200);
        }

        .task-item:hover::before {
          width: 5px;
        }

        .task-item:last-child {
          border-bottom: none;
        }

        .task-item.completed {
          opacity: 0.75;
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-50) 100%);
        }

        .task-item.completed .task-name {
          text-decoration: line-through;
          color: var(--gray-400);
        }

        /* Priority Indicator */
        .priority-indicator {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-base);
          border: 2px solid white;
        }

        .task-item:hover .priority-indicator {
          transform: scale(1.1);
          box-shadow: var(--shadow-md);
        }

        /* Task Content */
        .task-content {
          flex: 1;
          min-width: 0;
        }

        .task-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .task-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-800);
          word-wrap: break-word;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }

        .task-description {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 0.75rem;
          line-height: 1.6;
          word-wrap: break-word;
          padding: 0.5rem 0.75rem;
          background: var(--gray-50);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--gray-200);
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .priority-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.6875rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: var(--shadow-sm);
        }

        .priority-badge.HIGH {
          background: linear-gradient(135deg, var(--danger-500) 0%, var(--danger-600) 100%);
        }

        .priority-badge.MEDIUM {
          background: linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%);
        }

        .priority-badge.LOW {
          background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
        }

        .due-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          color: var(--gray-600);
          padding: 0.25rem 0.625rem;
          background: var(--gray-100);
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .due-date.overdue {
          color: var(--danger-600);
          font-weight: 600;
          background: linear-gradient(135deg, var(--danger-50) 0%, var(--danger-50) 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .created-time {
          font-size: 0.75rem;
          color: var(--gray-400);
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          background: var(--gray-50);
          border-radius: var(--radius-sm);
        }

        /* Task Actions */
        .task-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem;
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 1.125rem;
          transition: all var(--transition-base);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          box-shadow: var(--shadow-sm);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .action-btn.toggle-complete:hover {
          border-color: var(--success-500);
          background: linear-gradient(135deg, var(--success-50) 0%, var(--success-50) 100%);
        }

        .action-btn.edit-task:hover {
          border-color: var(--primary-400);
          background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-50) 100%);
        }

        .action-btn.delete-task:hover {
          border-color: var(--danger-500);
          background: linear-gradient(135deg, var(--danger-50) 0%, var(--danger-50) 100%);
        }

        /* Edit Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          width: 90%;
          max-width: 480px;
          box-shadow: var(--shadow-2xl);
          animation: slideIn 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--gray-200);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--gray-800);
          letter-spacing: -0.025em;
        }

        .modal-close {
          background: var(--gray-100);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          font-size: 1.25rem;
          color: var(--gray-500);
          cursor: pointer;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          color: var(--gray-700);
          background: var(--gray-200);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 0.375rem;
          letter-spacing: -0.01em;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1.5px solid var(--gray-300);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all var(--transition-fast);
          background: var(--gray-50);
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          background: white;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
          max-height: 150px;
          line-height: 1.5;
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--gray-400);
          text-align: right;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .char-count.warning {
          color: var(--warning-500);
        }

        .char-count.error {
          color: var(--danger-500);
        }

        .modal-actions {
          display: flex;
          gap: 0.625rem;
          justify-content: flex-end;
          margin-top: 1.25rem;
          padding-top: 0.875rem;
          border-top: 1px solid var(--gray-200);
        }

        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
        }

        .btn-cancel {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .btn-cancel:hover {
          background: var(--gray-200);
        }

        .btn-save {
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%);
          color: white;
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
        }

        .btn-save:hover {
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
          transform: translateY(-1px);
        }

        @media (max-width: 640px) {
          .task-item {
            flex-direction: column;
          }

          .task-actions {
            flex-direction: row;
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--gray-100);
          }

          .stats {
            flex-direction: column;
            gap: 0.625rem;
            align-items: flex-start;
          }

          .stats-left {
            flex-wrap: wrap;
            width: 100%;
            justify-content: center;
          }
          
          .task-item {
            padding: 1rem;
          }
        }
      </style>

      <div class="task-list">
        <div class="stats">
          <div class="stats-left">
            <span class="stat-item all ${this._activeFilter === 'all' ? 'active' : ''}" data-filter="all">
              📋 共 ${this._tasks.length} 个任务
            </span>
            <span class="stat-item completed ${this._activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">
              ✅ 已完成 ${this._tasks.filter(t => t.completed).length}
            </span>
            <span class="stat-item pending ${this._activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
              ⏳ 未完成 ${this._tasks.filter(t => !t.completed).length}
            </span>
          </div>
        </div>
        <div class="task-items-container">
          ${this._tasks.map(task => this.renderTaskItem(task)).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  renderTaskListOnly(tasks) {
    const container = this.shadowRoot.querySelector('.task-items-container');
    if (!container) {
      console.error('[TaskList] task-items-container not found');
      return;
    }
    
    if (!tasks || tasks.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem; text-align: center; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
          <div style="font-size: 1.125rem;">暂无符合条件的任务</div>
        </div>
      `;
      return;
    }
    
    container.innerHTML = tasks.map(task => this.renderTaskItem(task)).join('');
  }

  updateActiveFilter() {
    // Update active state on stat items
    this.shadowRoot.querySelectorAll('.stat-item').forEach(item => {
      item.classList.remove('active');
      if (item.dataset.filter === this._activeFilter) {
        item.classList.add('active');
      }
    });
  }

  renderTaskItem(task) {
    const priorityLabels = {
      HIGH: '高优先级',
      MEDIUM: '中优先级',
      LOW: '低优先级'
    };

    const priorityColors = {
      HIGH: '#ef4444',
      MEDIUM: '#f59e0b',
      LOW: '#10b981'
    };

    const dueDateLabel = task.dueDate
      ? task.dueDate
      : '无截止日期';

    const isOverdue = task.dueDate && !task.completed && task.dueDate < new Date().toISOString().split('T')[0];
    
    const createdDate = new Date(task.createdAt);
    const createdTimeStr = this.formatRelativeTime(createdDate);

    return `
      <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div
          class="priority-indicator"
          style="background: ${priorityColors[task.priority]}"
          title="${priorityLabels[task.priority]}"
        ></div>

        <div class="task-content">
          <div class="task-header">
            <div class="task-name">${this.escapeHtml(task.name)}</div>
          </div>
          ${task.description ? `
            <div class="task-description">${this.escapeHtml(task.description)}</div>
          ` : ''}
          <div class="task-meta">
            <span class="priority-badge ${task.priority}">
              ${priorityLabels[task.priority]}
            </span>
            <span class="due-date ${isOverdue ? 'overdue' : ''}">
              📅 ${dueDateLabel}
            </span>
            <span class="created-time">⏰ ${createdTimeStr}</span>
          </div>
        </div>

        <div class="task-actions">
          <button
            class="action-btn toggle-complete"
            data-task-id="${task.id}"
            title="${task.completed ? '标记为未完成' : '标记为完成'}"
          >
            ${task.completed ? '↩️' : '✅'}
          </button>
          <button
            class="action-btn edit-task"
            data-task-id="${task.id}"
            data-action="edit"
            title="编辑任务"
          >
            ✏️
          </button>
          <button
            class="action-btn delete-task"
            data-task-id="${task.id}"
            data-action="delete"
            title="删除任务"
          >
            🗑️
          </button>
        </div>
      </div>
    `;
  }

  renderEmpty() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --primary-50: #f5f3ff;
          --primary-100: #ede9fe;
          --primary-500: #8b5cf6;
          --primary-600: #7c3aed;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--gray-500);
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
          border-radius: var(--radius-xl);
          margin: 1rem;
          border: 1px dashed var(--gray-300);
        }

        .empty-state-icon {
          font-size: 4.5rem;
          margin-bottom: 1.25rem;
          opacity: 0.6;
          filter: grayscale(0.3);
        }

        .empty-state-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--gray-600);
          margin-bottom: 0.5rem;
        }

        .empty-state-hint {
          font-size: 0.875rem;
          color: var(--gray-400);
        }

        .stats {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
          border-radius: var(--radius-xl);
          margin: 1rem;
          font-size: 0.875rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid var(--gray-200);
        }

        .stats-left {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          width: 100%;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          background: white;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: all var(--transition-base);
          user-select: none;
          font-weight: 500;
          color: var(--gray-600);
          border: 1px solid var(--gray-200);
        }

        .stat-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-item.all.active {
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
          border-color: transparent;
        }
      </style>

      <div class="stats">
        <div class="stats-left">
          <span class="stat-item all ${this._activeFilter === 'all' ? 'active' : ''}" data-filter="all">
            📋 共 0 个任务
          </span>
          <span class="stat-item completed ${this._activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">
            ✅ 已完成 0
          </span>
          <span class="stat-item pending ${this._activeFilter === 'pending' ? 'active' : ''}" data-filter="pending">
            ⏳ 未完成 0
          </span>
        </div>
      </div>

      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">暂无任务，创建一个吧！</div>
        <div class="empty-state-hint">点击上方"新建任务"按钮添加第一个任务</div>
      </div>
    `;

    this.attachEvents();
  }

  renderEditModal(task) {
    const priorityLabels = {
      HIGH: '高',
      MEDIUM: '中',
      LOW: '低'
    };

    const descLength = task.description?.length || 0;
    const charCountClass = descLength >= 100 ? 'error' : (descLength >= 80 ? 'warning' : '');

    return `
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">编辑任务</h3>
            <button class="modal-close" data-action="close-modal">&times;</button>
          </div>
          
          <form id="edit-task-form">
            <input type="hidden" name="id" value="${task.id}">
            
            <div class="form-group">
              <label for="edit-name">任务名称</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value="${this.escapeHtml(task.name)}"
                required
                minlength="1"
                maxlength="200"
                placeholder="输入任务名称..."
              >
            </div>

            <div class="form-group">
              <label for="edit-description">任务描述 (可选，最多 100 字)</label>
              <textarea
                id="edit-description"
                name="description"
                placeholder="输入任务描述..."
                maxlength="100"
                rows="3"
              >${this.escapeHtml(task.description || '')}</textarea>
              <div class="char-count ${charCountClass}" id="edit-desc-count">${descLength}/100</div>
            </div>

            <div class="form-group">
              <label for="edit-priority">优先级</label>
              <select id="edit-priority" name="priority">
                <option value="HIGH" ${task.priority === 'HIGH' ? 'selected' : ''}>高</option>
                <option value="MEDIUM" ${task.priority === 'MEDIUM' ? 'selected' : ''}>中</option>
                <option value="LOW" ${task.priority === 'LOW' ? 'selected' : ''}>低</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-cancel" data-action="close-modal">取消</button>
              <button type="submit" class="btn btn-save">保存修改</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  attachEvents() {
    // Listen for task toggle events
    this.shadowRoot.addEventListener('click', (e) => {
      console.log('[TaskList] Click event, target:', e.target.className);
      const toggleBtn = e.target.closest('.toggle-complete');
      const editBtn = e.target.closest('.edit-task');
      const deleteBtn = e.target.closest('.delete-task');
      const closeModalBtn = e.target.closest('[data-action="close-modal"]');
      const statItem = e.target.closest('.stat-item');

      // Handle filter click
      if (statItem) {
        const filter = statItem.dataset.filter;
        console.log('[TaskList] Stat item clicked, filter:', filter);
        this.handleFilterClick(filter);
        return;
      }

      if (toggleBtn) {
        const taskId = toggleBtn.dataset.taskId;
        console.log('[TaskList] Toggle button clicked, taskId:', taskId);
        this.dispatchEvent(new CustomEvent('task-toggle', {
          detail: { id: taskId },
          bubbles: true,
          composed: true
        }));
      } else if (editBtn) {
        const taskId = editBtn.dataset.taskId;
        const task = this._tasks.find(t => t.id === taskId);
        if (task) {
          this.openEditModal(task);
        }
      } else if (deleteBtn) {
        const taskId = deleteBtn.dataset.taskId;
        if (confirm('确定要删除这个任务吗？')) {
          this.dispatchEvent(new CustomEvent('task-delete', {
            detail: { id: taskId },
            bubbles: true,
            composed: true
          }));
        }
      } else if (closeModalBtn) {
        this.closeEditModal();
      }
    });

    // Handle form submission in edit modal
    this.shadowRoot.addEventListener('submit', (e) => {
      if (e.target.id === 'edit-task-form') {
        e.preventDefault();
        this.handleEditSubmit(e.target);
      }
    });

    // Handle character count in edit modal
    this.shadowRoot.addEventListener('input', (e) => {
      if (e.target.id === 'edit-description') {
        const count = e.target.value.length;
        const charCount = this.shadowRoot.querySelector('#edit-desc-count');
        if (charCount) {
          charCount.textContent = `${count}/100`;
          charCount.className = `char-count ${count >= 100 ? 'error' : (count >= 80 ? 'warning' : '')}`;
        }
      }
    });

    // Close modal on overlay click
    this.shadowRoot.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeEditModal();
      }
    });
  }

  handleFilterClick(filter) {
    console.log('[TaskList] handleFilterClick called with:', filter);
    console.log('[TaskList] Current activeFilter:', this._activeFilter);
    console.log('[TaskList] Current tasks:', this._tasks);
    
    // Toggle filter: if clicking the same filter, reset to 'all'
    const newFilter = this._activeFilter === filter ? 'all' : filter;
    this._activeFilter = newFilter;
    
    console.log('[TaskList] New activeFilter:', newFilter);
    
    // Apply filter to get displayed tasks
    let filteredTasks = [...this._tasks];
    
    if (newFilter === 'completed') {
      filteredTasks = this._tasks.filter(t => t.completed);
    } else if (newFilter === 'pending') {
      filteredTasks = this._tasks.filter(t => !t.completed);
    }
    
    console.log('[TaskList] Filtered tasks:', filteredTasks);
    
    // Re-render the task list with filtered tasks
    this.renderTaskListOnly(filteredTasks);
    
    // Update active state in stats
    this.updateActiveFilter();
  }

  openEditModal(task) {
    this._editingTaskId = task.id;
    const modalHtml = this.renderEditModal(task);
    
    // Append modal to shadow DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(modalHtml, 'text/html');
    const modalOverlay = doc.querySelector('.modal-overlay');
    
    this.shadowRoot.appendChild(modalOverlay);
    
    // Focus on name input
    const nameInput = this.shadowRoot.querySelector('#edit-name');
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }

  closeEditModal() {
    const modal = this.shadowRoot.querySelector('.modal-overlay');
    if (modal) {
      modal.remove();
    }
    this._editingTaskId = null;
  }

  handleEditSubmit(form) {
    const formData = new FormData(form);
    const taskData = {
      id: formData.get('id'),
      name: formData.get('name').trim(),
      description: formData.get('description').trim(),
      priority: formData.get('priority')
    };

    // Validate
    if (!taskData.name) {
      alert('任务名称不能为空');
      return;
    }

    console.log('[TaskList] Editing task:', taskData);

    // Dispatch event from the host element
    const event = new CustomEvent('task-edit', {
      detail: taskData,
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(event);
    console.log('[TaskList] Dispatched task-edit event');

    this.closeEditModal();
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Format with hours and minutes
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    if (diffMins < 1) {
      return `刚刚 ${timeStr}`;
    } else if (diffMins < 60) {
      return `${diffMins} 分钟前 ${timeStr}`;
    } else if (diffHours < 24) {
      return `今天 ${timeStr}`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前 ${timeStr}`;
    } else {
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
      }) + ` ${timeStr}`;
    }
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('task-list', TaskList);
