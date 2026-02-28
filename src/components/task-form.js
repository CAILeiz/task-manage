/**
 * TaskForm Web Component
 *
 * Modal form for creating new tasks with name, description, priority, and due date.
 *
 * @fires task-create - Emitted when a new task is created
 */
export class TaskForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._visible = false;
    this._eventsAttached = false;
  }

  connectedCallback() {
    this.render();
  }

  show() {
    this._visible = true;
    this._eventsAttached = false;  // 重置事件标志
    this.render();
    this.attachEvents();
    this.setDefaultValues();
    
    setTimeout(() => {
      const nameInput = this.shadowRoot.querySelector('#task-name');
      if (nameInput) {
        nameInput.focus();
      }
    }, 50);
  }

  hide() {
    this._visible = false;
    const handleEsc = this._handleEsc;
    if (handleEsc) {
      document.removeEventListener('keydown', handleEsc);
    }
    this.render();
  }

  setDefaultValues() {
    const prioritySelect = this.shadowRoot.querySelector('#task-priority');
    if (prioritySelect) {
      prioritySelect.value = 'HIGH';
    }

    const dueDateInput = this.shadowRoot.querySelector('#task-due-date');
    if (dueDateInput) {
      const today = new Date().toISOString().split('T')[0];
      dueDateInput.value = today;
    }
  }

  render() {
    if (!this._visible) {
      this.shadowRoot.innerHTML = '';
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
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
          
          --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          
          --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
          --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: fadeIn 0.25s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          width: 90%;
          max-width: 500px;
          box-shadow: var(--shadow-2xl);
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
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
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--gray-800);
          letter-spacing: -0.025em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-close {
          background: var(--gray-100);
          border: none;
          width: 34px;
          height: 34px;
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
          background: var(--gray-200);
          color: var(--gray-700);
          transform: rotate(90deg);
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1.125rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--gray-700);
          margin-bottom: 0.375rem;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .form-group label .required {
          color: var(--danger-500);
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

        .form-group input:hover,
        .form-group textarea:hover,
        .form-group select:hover {
          border-color: var(--gray-400);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary-500);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
          background: white;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: var(--gray-400);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 90px;
          max-height: 180px;
          line-height: 1.6;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 1rem;
        }

        .char-count {
          font-size: 0.75rem;
          color: var(--gray-400);
          text-align: right;
          margin-top: 0.25rem;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .char-count.warning {
          color: var(--warning-500);
        }

        .char-count.error {
          color: var(--danger-500);
        }

        .error {
          color: var(--danger-500);
          font-size: 0.8125rem;
          margin-top: 0.375rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .error::before {
          content: '⚠️';
          font-size: 0.75rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 0.25rem;
          padding-top: 1rem;
          border-top: 1px solid var(--gray-200);
        }

        .btn {
          padding: 0.625rem 1.375rem;
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          border: none;
          box-sizing: border-box;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
        }

        .btn-cancel {
          background: var(--gray-100);
          color: var(--gray-600);
        }

        .btn-cancel:hover {
          background: var(--gray-200);
        }

        .btn-create {
          background: linear-gradient(135deg, var(--primary-600) 0%, var(--primary-500) 100%);
          color: white;
          box-shadow: 0 2px 10px rgba(124, 58, 237, 0.3);
        }

        .btn-create:hover {
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.45);
          transform: translateY(-1px);
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-400) 100%);
        }

        .btn-create:active {
          transform: translateY(0);
        }

        /* Toast notification */
        .toast {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%);
          color: white;
          padding: 0.875rem 1.5rem;
          border-radius: var(--radius-xl);
          font-size: 0.9375rem;
          font-weight: 600;
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.4);
          z-index: 9999;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 640px) {
          .modal {
            padding: 1.25rem;
            width: 95%;
            max-width: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
            text-align: center;
            padding: 0.75rem 1rem;
          }
        }
      </style>

      <div class="modal-overlay" data-action="overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title"><span>✨</span> 新建任务</h3>
            <button class="modal-close" data-action="close" title="关闭">×</button>
          </div>

          <form class="form" novalidate>
            <div class="form-group">
              <label for="task-name">任务名称 <span class="required">*</span></label>
              <input
                type="text"
                id="task-name"
                name="name"
                placeholder="例如：完成项目报告"
                required
                minlength="1"
                maxlength="200"
              >
              <div class="error" id="name-error"></div>
            </div>

            <div class="form-group">
              <label for="task-description">任务描述 <span style="font-weight: 400; color: var(--gray-400);">(可选，最多 100 字)</span></label>
              <textarea
                id="task-description"
                name="description"
                placeholder="详细描述任务内容..."
                maxlength="100"
                rows="3"
              ></textarea>
              <div class="char-count" id="desc-count">0/100</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="task-priority">优先级</label>
                <select id="task-priority" name="priority">
                  <option value="HIGH">🔴 高</option>
                  <option value="MEDIUM">🟡 中</option>
                  <option value="LOW">🟢 低</option>
                </select>
              </div>

              <div class="form-group">
                <label for="task-due-date">截止日期</label>
                <input
                  type="date"
                  id="task-due-date"
                  name="dueDate"
                >
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-cancel" data-action="cancel">
                <span>✕</span> 取消
              </button>
              <button type="submit" class="btn btn-create">
                <span>✓</span> 创建任务
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  attachEvents() {
    const form = this.shadowRoot.querySelector('form');
    const descriptionTextarea = this.shadowRoot.querySelector('#task-description');
    const charCount = this.shadowRoot.querySelector('#desc-count');
    const closeBtn = this.shadowRoot.querySelector('[data-action="close"]');
    const cancelBtn = this.shadowRoot.querySelector('[data-action="cancel"]');
    const overlay = this.shadowRoot.querySelector('[data-action="overlay"]');

    if (!form) return;

    // Character count
    if (descriptionTextarea && charCount) {
      descriptionTextarea.addEventListener('input', () => {
        const count = descriptionTextarea.value.length;
        charCount.textContent = `${count}/100`;
        charCount.className = `char-count ${count >= 100 ? 'error' : (count >= 80 ? 'warning' : '')}`;
      });
    }

    // Close handlers
    const closeModal = () => {
      this.hide();
    };

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }

    // Overlay click
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });
    }

    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // ESC key
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
        this._handleEsc = null;
      }
    };
    document.addEventListener('keydown', handleEsc);
    this._handleEsc = handleEsc;
  }

  handleSubmit() {
    const nameInput = this.shadowRoot.querySelector('#task-name');
    const descriptionInput = this.shadowRoot.querySelector('#task-description');
    const prioritySelect = this.shadowRoot.querySelector('#task-priority');
    const dueDateInput = this.shadowRoot.querySelector('#task-due-date');
    const nameError = this.shadowRoot.querySelector('#name-error');

    if (nameError) nameError.textContent = '';

    const name = nameInput.value.trim();
    if (!name) {
      if (nameError) nameError.textContent = '任务名称不能为空';
      nameInput.focus();
      return;
    }

    const taskData = {
      name: name,
      description: descriptionInput.value.trim(),
      priority: prioritySelect.value,
      dueDate: dueDateInput.value || null
    };

    console.log('[TaskForm] Creating task:', taskData);

    this.dispatchEvent(new CustomEvent('task-create', {
      detail: taskData,
      bubbles: true,
      composed: true
    }));

    this.showToast('✅ 任务创建成功！');
    this.resetForm();
    this.hide();
  }

  showToast(message) {
    const existingToast = this.shadowRoot.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 0.875rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.9375rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  resetForm() {
    const form = this.shadowRoot.querySelector('form');
    if (form) form.reset();
    const descCount = this.shadowRoot.querySelector('#desc-count');
    if (descCount) descCount.textContent = '0/100';
  }
}

customElements.define('task-form', TaskForm);
