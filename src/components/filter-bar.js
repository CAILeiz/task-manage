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
          --primary-50: #f5f3ff;
          --primary-100: #ede9fe;
          --primary-400: #a78bfa;
          --primary-500: #8b5cf6;
          --primary-600: #7c3aed;
          
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          
          --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
          
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--gray-600);
          white-space: nowrap;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        label::before {
          content: '🎯';
          font-size: 0.875rem;
        }

        .filter-group:nth-child(2) label::before {
          content: '📅';
        }

        .select-wrapper {
          position: relative;
          display: inline-block;
        }

        select {
          appearance: none;
          -webkit-appearance: none;
          padding: 0.5rem 2.25rem 0.5rem 0.875rem;
          border: 1.5px solid var(--gray-300);
          border-radius: var(--radius-lg);
          background: white;
          color: var(--gray-700);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          min-width: 150px;
          box-shadow: var(--shadow-sm);
        }

        select:hover {
          border-color: var(--gray-400);
          box-shadow: var(--shadow-md);
        }

        select:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .select-arrow {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--gray-400);
          transition: color var(--transition-fast);
        }

        select:hover + .select-arrow {
          color: var(--gray-500);
        }

        @media (max-width: 640px) {
          :host {
            flex-direction: column;
            gap: 0.625rem;
          }

          .filter-group {
            width: 100%;
          }

          select {
            width: 100%;
            min-width: auto;
          }
        }
      </style>

      <div class="filter-group">
        <label for="priority-filter">优先级</label>
        <div class="select-wrapper">
          <select id="priority-filter">
            <option value="">所有优先级</option>
            <option value="HIGH">🔴 高</option>
            <option value="MEDIUM">🟡 中</option>
            <option value="LOW">🟢 低</option>
          </select>
          <span class="select-arrow">▼</span>
        </div>
      </div>

      <div class="filter-group">
        <label for="due-date-filter">截止日期</label>
        <div class="select-wrapper">
          <select id="due-date-filter">
            <option value="">所有日期</option>
            <option value="today">📆 今天到期</option>
            <option value="upcoming">⏰ 即将到期</option>
            <option value="overdue">⚠️ 已过期</option>
            <option value="none">∞ 无截止日期</option>
          </select>
          <span class="select-arrow">▼</span>
        </div>
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
