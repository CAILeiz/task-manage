/**
 * TaskItem Web Component
 * 
 * Displays a single task with priority indicator, name, due date, and completion toggle.
 * 
 * @fires task-toggle - Emitted when task completion status is toggled
 */
export class TaskItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._task = null;
  }
  
  static get observedAttributes() {
    return ['task-data'];
  }
  
  set task(taskData) {
    this._task = taskData;
    this.render();
  }
  
  get task() {
    return this._task;
  }
  
  connectedCallback() {
    if (this._task) {
      this.render();
    }
  }
  
  render() {
    if (!this._task) return;
    
    const priorityLabels = {
      HIGH: '高',
      MEDIUM: '中',
      LOW: '低'
    };
    
    const priorityColors = {
      HIGH: '#ef4444',
      MEDIUM: '#f59e0b',
      LOW: '#10b981'
    };
    
    const dueDateLabel = this._task.dueDate 
      ? this._task.dueDate
      : '无截止日期';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.2s;
        }
        
        .task-item:hover {
          background: #f9fafb;
        }
        
        .task-item:last-child {
          border-bottom: none;
        }
        
        .priority-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .task-content {
          flex: 1;
          min-width: 0;
        }
        
        .task-name {
          font-size: 1rem;
          color: #111827;
          margin-bottom: 0.25rem;
          word-wrap: break-word;
        }
        
        .task-name.completed {
          text-decoration: line-through;
          color: #9ca3af;
        }
        
        .task-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #6b7280;
        }
        
        .priority-badge {
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          font-weight: 500;
          color: white;
        }
        
        .due-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .due-date.overdue {
          color: #ef4444;
          font-weight: 500;
        }
        
        .toggle-complete {
          padding: 0.5rem;
          background: transparent;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          transition: all 0.2s;
        }
        
        .toggle-complete:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .toggle-complete:active {
          background: #e5e7eb;
        }
      </style>
      
      <div class="task-item">
        <div 
          class="priority-indicator" 
          style="background: ${priorityColors[this._task.priority]}"
          title="优先级：${priorityLabels[this._task.priority]}"
        ></div>
        
        <div class="task-content">
          <div class="task-name ${this._task.completed ? 'completed' : ''}">
            ${this.escapeHtml(this._task.name)}
          </div>
          <div class="task-meta">
            <span 
              class="priority-badge" 
              style="background: ${priorityColors[this._task.priority]}"
            >
              ${priorityLabels[this._task.priority]}
            </span>
            <span class="due-date ${this.isOverdue() ? 'overdue' : ''}">
              📅 ${dueDateLabel}
            </span>
          </div>
        </div>
        
        <button 
          class="toggle-complete" 
          title="${this._task.completed ? '标记为未完成' : '标记为完成'}"
        >
          ${this._task.completed ? '↩️' : '✅'}
        </button>
      </div>
    `;
    
    this.attachEvents();
  }
  
  attachEvents() {
    const button = this.shadowRoot.querySelector('.toggle-complete');
    button.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('task-toggle', {
        detail: { id: this._task.id },
        bubbles: true,
        composed: true
      }));
    });
  }
  
  isOverdue() {
    if (!this._task.dueDate || this._task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return this._task.dueDate < today;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

customElements.define('task-item', TaskItem);
