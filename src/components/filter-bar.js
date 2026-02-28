/**
 * FilterBar Web Component
 * 
 * Provides priority and due date filtering controls.
 * 
 * @fires filter-change - Emitted when filter selection changes
 */
export class FilterBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
    this.attachEvents();
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #6b7280;
          white-space: nowrap;
        }
        
        select {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          background: white;
          color: #111827;
          font-size: 0.875rem;
          cursor: pointer;
          min-width: 140px;
        }
        
        select:hover {
          border-color: #9ca3af;
        }
        
        select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        @media (max-width: 640px) {
          :host {
            flex-direction: column;
          }
          
          .filter-group {
            width: 100%;
          }
          
          select {
            width: 100%;
          }
        }
      </style>
      
      <div class="filter-group">
        <label for="priority-filter">优先级:</label>
        <select id="priority-filter">
          <option value="">所有优先级</option>
          <option value="HIGH">高</option>
          <option value="MEDIUM">中</option>
          <option value="LOW">低</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="due-date-filter">截止日期:</label>
        <select id="due-date-filter">
          <option value="">所有日期</option>
          <option value="today">今天到期</option>
          <option value="upcoming">即将到期</option>
          <option value="overdue">已过期</option>
          <option value="none">无截止日期</option>
        </select>
      </div>
    `;
  }
  
  attachEvents() {
    const prioritySelect = this.shadowRoot.querySelector('#priority-filter');
    const dueDateSelect = this.shadowRoot.querySelector('#due-date-filter');
    
    prioritySelect.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('filter-change', {
        detail: { type: 'priority', value: e.target.value },
        bubbles: true,
        composed: true
      }));
    });
    
    dueDateSelect.addEventListener('change', (e) => {
      this.dispatchEvent(new CustomEvent('filter-change', {
        detail: { type: 'dueDate', value: e.target.value },
        bubbles: true,
        composed: true
      }));
    });
  }
}

customElements.define('filter-bar', FilterBar);
