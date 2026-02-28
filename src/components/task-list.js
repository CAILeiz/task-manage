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
        }

        .task-list {
          display: flex;
          flex-direction: column;
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1rem;
          margin: 1rem;
        }

        .empty-state-icon {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .empty-state-text {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state-hint {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .stats {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.875rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-left {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          background: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .stat-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-item.completed {
          color: #059669;
          font-weight: 600;
        }

        .stat-item.completed:hover {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }

        .stat-item.completed.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .stat-item.pending {
          color: #d97706;
          font-weight: 600;
        }

        .stat-item.pending:hover {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .stat-item.pending.active {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }

        .stat-item.all.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Task Item Styles */
        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
          background: linear-gradient(180deg, #e2e8f0 0%, #f1f5f9 100%);
          transition: all 0.3s;
        }

        .task-item.HIGH::before {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }

        .task-item.MEDIUM::before {
          background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        }

        .task-item.LOW::before {
          background: linear-gradient(180deg, #10b981 0%, #059669 100%);
        }

        .task-item:hover {
          background: linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .task-item:hover::before {
          width: 6px;
        }

        .task-item:last-child {
          border-bottom: none;
        }

        .task-item.completed {
          opacity: 0.7;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
        }

        .task-item.completed .task-name {
          text-decoration: line-through;
          color: #9ca3af;
        }

        /* Priority Indicator */
        .priority-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.3s;
          border: 2px solid white;
        }

        .task-item:hover .priority-indicator {
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
          font-size: 1.0625rem;
          font-weight: 600;
          color: #1f2937;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .task-description {
          font-size: 0.9375rem;
          color: #6b7280;
          margin-bottom: 0.875rem;
          line-height: 1.6;
          word-wrap: break-word;
          padding: 0.5rem 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
          border-left: 3px solid #e5e7eb;
        }

        .task-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.625rem;
          align-items: center;
        }

        .priority-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .priority-badge.HIGH {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .priority-badge.MEDIUM {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .priority-badge.LOW {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .due-date {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.8125rem;
          color: #4b5563;
          padding: 0.25rem 0.625rem;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 0.5rem;
          font-weight: 500;
        }

        .due-date.overdue {
          color: #dc2626;
          font-weight: 600;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .created-time {
          font-size: 0.8125rem;
          color: #9ca3af;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          background: #f9fafb;
          border-radius: 0.375rem;
        }

        /* Task Actions */
        .task-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .action-btn {
          padding: 0.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          cursor: pointer;
          font-size: 1.125rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .action-btn:active {
          transform: translateY(0);
        }

        .action-btn.toggle-complete:hover {
          border-color: #10b981;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }

        .action-btn.edit-task:hover {
          border-color: #3b82f6;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .action-btn.delete-task:hover {
          border-color: #ef4444;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        }

        /* Edit Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
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
          border-radius: 1.25rem;
          padding: 1.75rem;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: slideIn 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 0.875rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .modal-close {
          background: transparent;
          border: none;
          font-size: 1.75rem;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: all 0.2s;
          border-radius: 0.5rem;
        }

        .modal-close:hover {
          color: #1f2937;
          background: #f3f4f6;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.375rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.625rem;
          font-size: 0.9375rem;
          font-family: inherit;
          transition: all 0.2s;
          background: #f9fafb;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
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
          color: #9ca3af;
          text-align: right;
          margin-top: 0.25rem;
          font-weight: 500;
        }

        .char-count.warning {
          color: #f59e0b;
        }

        .char-count.error {
          color: #ef4444;
        }

        .modal-actions {
          display: flex;
          gap: 0.625rem;
          justify-content: flex-end;
          margin-top: 1.25rem;
          padding-top: 0.875rem;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 0.625rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #4b5563;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-save {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        }

        .btn-save:hover {
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
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
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
          }

          .stats {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
          }

          .stats-left {
            flex-wrap: wrap;
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
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #6b7280;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 1rem;
          margin: 1rem;
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state-text {
          font-size: 1.25rem;
          color: #9ca3af;
        }

        .empty-state-hint {
          font-size: 0.875rem;
          margin-top: 0.5rem;
          color: #d1d5db;
        }

        .stats {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 1rem;
          margin: 1rem;
          font-size: 0.875rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stats-left {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          width: 100%;
          justify-content: center;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          background: white;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
        }

        .stat-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-item.all.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
        <div class="empty-state-hint">点击上方表单添加新任务</div>
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
