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
          animation: fadeIn 0.2s ease-out;
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

        .modal {
          background: white;
          border-radius: 1.25rem;
          padding: 1.5rem;
          width: 90%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          animation: slideIn 0.3s ease-out;
          max-height: 90vh;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .modal-close {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          font-size: 1.25rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
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
          border: 2px solid #e2e8f0;
          border-radius: 0.625rem;
          font-size: 0.875rem;
          font-family: inherit;
          transition: all 0.2s;
          background: #f8fafc;
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

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .char-count {
          font-size: 0.75rem;
          color: #94a3b8;
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

        .error {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.625rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          box-sizing: border-box;
        }

        .btn-cancel {
          background: #f1f5f9;
          color: #475569;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-create {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
        }

        .btn-create:hover {
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
          transform: translateY(-1px);
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
          }
        }
      </style>

      <div class="modal-overlay" data-action="overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">➕ 新建任务</h3>
            <button class="modal-close" data-action="close" title="关闭">×</button>
          </div>

          <form class="form" novalidate>
            <div class="form-group">
              <label for="task-name">任务名称</label>
              <input
                type="text"
                id="task-name"
                name="name"
                placeholder="输入任务名称..."
                required
                minlength="1"
                maxlength="200"
              >
              <div class="error" id="name-error"></div>
            </div>

            <div class="form-group">
              <label for="task-description">任务描述 <span style="font-weight: 400; color: #94a3b8;">(可选，最多 100 字)</span></label>
              <textarea
                id="task-description"
                name="description"
                placeholder="输入任务描述..."
                maxlength="100"
                rows="2"
              ></textarea>
              <div class="char-count" id="desc-count">0/100</div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="task-priority">优先级</label>
                <select id="task-priority" name="priority">
                  <option value="HIGH">高</option>
                  <option value="MEDIUM">中</option>
                  <option value="LOW">低</option>
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
              <button type="button" class="btn btn-cancel" data-action="cancel">取消</button>
              <button type="submit" class="btn btn-create">创建任务</button>
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
