(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=t(o);fetch(o.href,a)}})();const x="task-manager-db",y=1,h="tasks";async function w(){return new Promise((s,e)=>{const t=indexedDB.open(x,y);t.onerror=()=>{var r;e(new Error(`Failed to open database: ${(r=t.error)==null?void 0:r.message}`))},t.onsuccess=()=>{s(t.result)},t.onupgradeneeded=r=>{const o=r.target.result;if(!o.objectStoreNames.contains(h)){const a=o.createObjectStore(h,{keyPath:"id"});a.createIndex("priority","priority",{unique:!1}),a.createIndex("dueDate","dueDate",{unique:!1}),a.createIndex("completed","completed",{unique:!1}),a.createIndex("createdAt","createdAt",{unique:!1})}}})}let m=null;async function p(){return m||(m=await w(),m)}function v(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(s){const e=Math.random()*16|0;return(s==="x"?e:e&3|8).toString(16)})}const f={HIGH:"HIGH",MEDIUM:"MEDIUM",LOW:"LOW"};function u(s){const e=[];return!s.name||typeof s.name!="string"?e.push("Name is required"):(s.name.trim().length===0||s.name.length>200)&&e.push("Name must be 1-200 characters"),s.description!==void 0&&s.description!==null&&(typeof s.description!="string"?e.push("Description must be a string"):s.description.length>100&&e.push("Description must be 100 characters or less")),[f.HIGH,f.MEDIUM,f.LOW].includes(s.priority)||e.push("Priority must be HIGH, MEDIUM, or LOW"),s.dueDate!==null&&s.dueDate!==void 0&&(k(s.dueDate)||e.push("dueDate must be ISO 8601 format (YYYY-MM-DD)")),typeof s.completed!="boolean"&&e.push("completed must be a boolean"),typeof s.createdAt!="number"&&e.push("createdAt must be a timestamp"),typeof s.updatedAt!="number"&&e.push("updatedAt must be a timestamp"),{valid:e.length===0,errors:e}}function k(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return!1;const e=new Date(s);return!isNaN(e.getTime())}function E({name:s,priority:e,description:t="",dueDate:r=null,completed:o=!1}){const a=Date.now(),i={id:v(),name:s.trim(),description:(t==null?void 0:t.trim())||"",priority:e,dueDate:r,completed:o,createdAt:a,updatedAt:a},n=u(i);if(!n.valid)throw new Error(`Invalid task: ${n.errors.join(", ")}`);return i}function g(s,e){const t={...s,...e,updatedAt:Date.now()},r=u(t);if(!r.valid)throw new Error(`Invalid task update: ${r.errors.join(", ")}`);return t}const c="tasks";class D{async create(e){const t=await p();return new Promise((r,o)=>{const a=u(e);if(!a.valid){o(new Error(`Validation failed: ${a.errors.join(", ")}`));return}const l=t.transaction(c,"readwrite").objectStore(c).add(e);l.onsuccess=()=>r(e),l.onerror=()=>{var d;return o(new Error(`Failed to create task: ${(d=l.error)==null?void 0:d.message}`))}})}async findAll(){const e=await p();return new Promise((t,r)=>{const i=e.transaction(c,"readonly").objectStore(c).getAll();i.onsuccess=()=>t(i.result),i.onerror=()=>{var n;return r(new Error(`Failed to find tasks: ${(n=i.error)==null?void 0:n.message}`))}})}async findById(e){const t=await p();return new Promise((r,o)=>{const n=t.transaction(c,"readonly").objectStore(c).get(e);n.onsuccess=()=>r(n.result||null),n.onerror=()=>{var l;return o(new Error(`Failed to find task: ${(l=n.error)==null?void 0:l.message}`))}})}async update(e){const t=await p();return new Promise((r,o)=>{const a=u(e);if(!a.valid){o(new Error(`Validation failed: ${a.errors.join(", ")}`));return}const l=t.transaction(c,"readwrite").objectStore(c).put(e);l.onsuccess=()=>r(e),l.onerror=()=>{var d;return o(new Error(`Failed to update task: ${(d=l.error)==null?void 0:d.message}`))}})}async delete(e){const t=await p();return new Promise((r,o)=>{const n=t.transaction(c,"readwrite").objectStore(c).delete(e);n.onsuccess=()=>r(),n.onerror=()=>{var l;return o(new Error(`Failed to delete task: ${(l=n.error)==null?void 0:l.message}`))}})}async findByPriority(e){const t=await p();return new Promise((r,o)=>{const l=t.transaction(c,"readonly").objectStore(c).index("priority").getAll(e);l.onsuccess=()=>r(l.result),l.onerror=()=>{var d;return o(new Error(`Failed to find tasks by priority: ${(d=l.error)==null?void 0:d.message}`))}})}async findByDueDate(e){const t=await this.findAll(),r=new Date;switch(r.setHours(0,0,0,0),e){case"today":return t.filter(o=>o.dueDate?new Date(o.dueDate).toDateString()===r.toDateString():!1);case"upcoming":{const o=new Date(r);return o.setDate(o.getDate()+7),t.filter(a=>{if(!a.dueDate)return!1;const i=new Date(a.dueDate);return i>=r&&i<=o})}case"overdue":return t.filter(o=>!o.dueDate||o.completed?!1:new Date(o.dueDate)<r);case"none":return t.filter(o=>!o.dueDate);default:throw new Error(`Unknown date filter: ${e}`)}}}class T extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._tasks=[],this._editingTaskId=null}set tasks(e){this._tasks=e||[],this.render()}get tasks(){return this._tasks}connectedCallback(){this.render()}render(){if(!this._tasks||this._tasks.length===0){this.renderEmpty(),this.attachEvents();return}this.shadowRoot.innerHTML=`
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
        }

        .stat-item.completed {
          color: #059669;
          font-weight: 600;
        }

        .stat-item.pending {
          color: #d97706;
          font-weight: 600;
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
            <span class="stat-item">共 ${this._tasks.length} 个任务</span>
            <span class="stat-item completed">✅ 已完成 ${this._tasks.filter(e=>e.completed).length}</span>
            <span class="stat-item pending">⏳ 未完成 ${this._tasks.filter(e=>!e.completed).length}</span>
          </div>
        </div>
        ${this._tasks.map(e=>this.renderTaskItem(e)).join("")}
      </div>
    `,this.attachEvents()}renderTaskItem(e){const t={HIGH:"高优先级",MEDIUM:"中优先级",LOW:"低优先级"},r={HIGH:"#ef4444",MEDIUM:"#f59e0b",LOW:"#10b981"},o=e.dueDate?e.dueDate:"无截止日期",a=e.dueDate&&!e.completed&&e.dueDate<new Date().toISOString().split("T")[0],i=new Date(e.createdAt),n=this.formatRelativeTime(i);return`
      <div class="task-item ${e.priority} ${e.completed?"completed":""}" data-task-id="${e.id}">
        <div
          class="priority-indicator"
          style="background: ${r[e.priority]}"
          title="${t[e.priority]}"
        ></div>

        <div class="task-content">
          <div class="task-header">
            <div class="task-name">${this.escapeHtml(e.name)}</div>
          </div>
          ${e.description?`
            <div class="task-description">${this.escapeHtml(e.description)}</div>
          `:""}
          <div class="task-meta">
            <span class="priority-badge ${e.priority}">
              ${t[e.priority]}
            </span>
            <span class="due-date ${a?"overdue":""}">
              📅 ${o}
            </span>
            <span class="created-time">⏰ ${n}</span>
          </div>
        </div>

        <div class="task-actions">
          <button
            class="action-btn toggle-complete"
            data-task-id="${e.id}"
            title="${e.completed?"标记为未完成":"标记为完成"}"
          >
            ${e.completed?"↩️":"✅"}
          </button>
          <button
            class="action-btn edit-task"
            data-task-id="${e.id}"
            data-action="edit"
            title="编辑任务"
          >
            ✏️
          </button>
          <button
            class="action-btn delete-task"
            data-task-id="${e.id}"
            data-action="delete"
            title="删除任务"
          >
            🗑️
          </button>
        </div>
      </div>
    `}renderEmpty(){this.shadowRoot.innerHTML=`
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
      </style>

      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">暂无任务，创建一个吧！</div>
        <div class="empty-state-hint">点击上方表单添加新任务</div>
      </div>
    `}renderEditModal(e){var o;const t=((o=e.description)==null?void 0:o.length)||0,r=t>=100?"error":t>=80?"warning":"";return`
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">编辑任务</h3>
            <button class="modal-close" data-action="close-modal">&times;</button>
          </div>
          
          <form id="edit-task-form">
            <input type="hidden" name="id" value="${e.id}">
            
            <div class="form-group">
              <label for="edit-name">任务名称</label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value="${this.escapeHtml(e.name)}"
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
              >${this.escapeHtml(e.description||"")}</textarea>
              <div class="char-count ${r}" id="edit-desc-count">${t}/100</div>
            </div>

            <div class="form-group">
              <label for="edit-priority">优先级</label>
              <select id="edit-priority" name="priority">
                <option value="HIGH" ${e.priority==="HIGH"?"selected":""}>高</option>
                <option value="MEDIUM" ${e.priority==="MEDIUM"?"selected":""}>中</option>
                <option value="LOW" ${e.priority==="LOW"?"selected":""}>低</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-cancel" data-action="close-modal">取消</button>
              <button type="submit" class="btn btn-save">保存修改</button>
            </div>
          </form>
        </div>
      </div>
    `}attachEvents(){this.shadowRoot.addEventListener("click",e=>{const t=e.target.closest(".toggle-complete"),r=e.target.closest(".edit-task"),o=e.target.closest(".delete-task"),a=e.target.closest('[data-action="close-modal"]');if(t){const i=t.dataset.taskId;console.log("[TaskList] Toggle button clicked, taskId:",i),this.dispatchEvent(new CustomEvent("task-toggle",{detail:{id:i},bubbles:!0,composed:!0}))}else if(r){const i=r.dataset.taskId,n=this._tasks.find(l=>l.id===i);n&&this.openEditModal(n)}else if(o){const i=o.dataset.taskId;confirm("确定要删除这个任务吗？")&&this.dispatchEvent(new CustomEvent("task-delete",{detail:{id:i},bubbles:!0,composed:!0}))}else a&&this.closeEditModal()}),this.shadowRoot.addEventListener("submit",e=>{e.target.id==="edit-task-form"&&(e.preventDefault(),this.handleEditSubmit(e.target))}),this.shadowRoot.addEventListener("input",e=>{if(e.target.id==="edit-description"){const t=e.target.value.length,r=this.shadowRoot.querySelector("#edit-desc-count");r&&(r.textContent=`${t}/100`,r.className=`char-count ${t>=100?"error":t>=80?"warning":""}`)}}),this.shadowRoot.addEventListener("click",e=>{e.target.classList.contains("modal-overlay")&&this.closeEditModal()})}openEditModal(e){this._editingTaskId=e.id;const t=this.renderEditModal(e),a=new DOMParser().parseFromString(t,"text/html").querySelector(".modal-overlay");this.shadowRoot.appendChild(a);const i=this.shadowRoot.querySelector("#edit-name");i&&(i.focus(),i.select())}closeEditModal(){const e=this.shadowRoot.querySelector(".modal-overlay");e&&e.remove(),this._editingTaskId=null}handleEditSubmit(e){const t=new FormData(e),r={id:t.get("id"),name:t.get("name").trim(),description:t.get("description").trim(),priority:t.get("priority")};if(!r.name){alert("任务名称不能为空");return}console.log("[TaskList] Editing task:",r);const o=new CustomEvent("task-edit",{detail:r,bubbles:!0,composed:!0});this.dispatchEvent(o),console.log("[TaskList] Dispatched task-edit event"),this.closeEditModal()}formatRelativeTime(e){const r=new Date-e,o=Math.floor(r/6e4),a=Math.floor(r/36e5),i=Math.floor(r/864e5),n=String(e.getHours()).padStart(2,"0"),l=String(e.getMinutes()).padStart(2,"0"),d=`${n}:${l}`;return o<1?`刚刚 ${d}`:o<60?`${o} 分钟前 ${d}`:a<24?`今天 ${d}`:i<7?`${i} 天前 ${d}`:e.toLocaleDateString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit"})+` ${d}`}escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}}customElements.define("task-list",T);class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.render(),this.attachEvents()}render(){this.shadowRoot.innerHTML=`
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
    `}attachEvents(){const e=this.shadowRoot.querySelector("#priority-filter"),t=this.shadowRoot.querySelector("#due-date-filter");e.addEventListener("change",r=>{this.dispatchEvent(new CustomEvent("filter-change",{detail:{type:"priority",value:r.target.value},bubbles:!0,composed:!0}))}),t.addEventListener("change",r=>{this.dispatchEvent(new CustomEvent("filter-change",{detail:{type:"dueDate",value:r.target.value},bubbles:!0,composed:!0}))})}}customElements.define("filter-bar",S);class I extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._visible=!1,this._eventsAttached=!1}connectedCallback(){this.render()}show(){this._visible=!0,this._eventsAttached=!1,this.render(),this.attachEvents(),this.setDefaultValues(),setTimeout(()=>{const e=this.shadowRoot.querySelector("#task-name");e&&e.focus()},50)}hide(){this._visible=!1;const e=this._handleEsc;e&&document.removeEventListener("keydown",e),this.render()}setDefaultValues(){const e=this.shadowRoot.querySelector("#task-priority");e&&(e.value="HIGH");const t=this.shadowRoot.querySelector("#task-due-date");if(t){const r=new Date().toISOString().split("T")[0];t.value=r}}render(){if(!this._visible){this.shadowRoot.innerHTML="";return}this.shadowRoot.innerHTML=`
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
    `}attachEvents(){const e=this.shadowRoot.querySelector("form"),t=this.shadowRoot.querySelector("#task-description"),r=this.shadowRoot.querySelector("#desc-count"),o=this.shadowRoot.querySelector('[data-action="close"]'),a=this.shadowRoot.querySelector('[data-action="cancel"]'),i=this.shadowRoot.querySelector('[data-action="overlay"]');if(!e)return;t&&r&&t.addEventListener("input",()=>{const d=t.value.length;r.textContent=`${d}/100`,r.className=`char-count ${d>=100?"error":d>=80?"warning":""}`});const n=()=>{this.hide()};o&&o.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation(),n()}),a&&a.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation(),n()}),i&&i.addEventListener("click",d=>{d.target===i&&n()}),e.addEventListener("submit",d=>{d.preventDefault(),this.handleSubmit()});const l=d=>{d.key==="Escape"&&(n(),document.removeEventListener("keydown",l),this._handleEsc=null)};document.addEventListener("keydown",l),this._handleEsc=l}handleSubmit(){const e=this.shadowRoot.querySelector("#task-name"),t=this.shadowRoot.querySelector("#task-description"),r=this.shadowRoot.querySelector("#task-priority"),o=this.shadowRoot.querySelector("#task-due-date"),a=this.shadowRoot.querySelector("#name-error");a&&(a.textContent="");const i=e.value.trim();if(!i){a&&(a.textContent="任务名称不能为空"),e.focus();return}const n={name:i,description:t.value.trim(),priority:r.value,dueDate:o.value||null};console.log("[TaskForm] Creating task:",n),this.dispatchEvent(new CustomEvent("task-create",{detail:n,bubbles:!0,composed:!0})),this.showToast("✅ 任务创建成功！"),this.resetForm(),this.hide()}showToast(e){const t=this.shadowRoot.querySelector(".toast");t&&t.remove();const r=document.createElement("div");r.className="toast",r.textContent=e,r.style.cssText=`
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
    `;const o=document.createElement("style");o.textContent=`
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,this.shadowRoot.appendChild(o),this.shadowRoot.appendChild(r),setTimeout(()=>{r.style.animation="fadeOut 0.3s ease-out forwards",setTimeout(()=>r.remove(),300)},2500)}resetForm(){const e=this.shadowRoot.querySelector("form");e&&e.reset();const t=this.shadowRoot.querySelector("#desc-count");t&&(t.textContent="0/100")}}customElements.define("task-form",I);class b{constructor(){this.repository=new D,this.tasks=[],this.filters={priority:"",dueDate:""},this.taskForm=null}async init(){try{await this.loadTasks(),this.attachEvents(),this.render(),console.log("[App] Initialized successfully")}catch(e){console.error("[App] Initialization failed:",e)}}async loadTasks(){this.tasks=await this.repository.findAll(),console.log("[App] Loaded tasks:",this.tasks.length)}attachEvents(){this.taskForm=document.querySelector("task-form");const e=document.getElementById("add-task-btn");e&&e.addEventListener("click",()=>{console.log("[App] Add task button clicked"),this.taskForm&&this.taskForm.show()}),document.addEventListener("task-create",async r=>{console.log("[App] Received task-create event:",r.detail),await this.handleCreateTask(r.detail)});const t=()=>{const r=document.querySelector("task-list");r?(r.addEventListener("task-toggle",async o=>{await this.handleToggleTask(o.detail.id)}),r.addEventListener("task-edit",async o=>{await this.handleEditTask(o.detail)}),r.addEventListener("task-delete",async o=>{await this.handleDeleteTask(o.detail.id)}),console.log("[App] Task-list event listeners attached")):setTimeout(t,100)};t(),document.addEventListener("filter-change",r=>{this.handleFilterChange(r.detail)})}async handleCreateTask(e){try{const t=E(e);await this.repository.create(t),this.tasks.push(t),this.render(),console.log("[App] Task created:",t.id)}catch(t){console.error("[App] Failed to create task:",t),alert(`创建任务失败：${t.message}`)}}async handleToggleTask(e){console.log("[App] handleToggleTask called with taskId:",e);try{const t=this.tasks.find(a=>a.id===e);if(!t){console.error("[App] Task not found:",e);return}console.log("[App] Found task:",t),console.log("[App] Current completed status:",t.completed);const r=g(t,{completed:!t.completed});console.log("[App] Updated task:",r),await this.repository.update(r),console.log("[App] Task saved to repository");const o=this.tasks.findIndex(a=>a.id===e);this.tasks[o]=r,console.log("[App] Local state updated"),this.render(),console.log("[App] Render called, task toggled:",e)}catch(t){console.error("[App] Failed to toggle task:",t)}}async handleEditTask(e){console.log("[App] Received task-edit:",e);try{const t=this.tasks.find(a=>a.id===e.id);if(!t){console.error("[App] Task not found:",e.id);return}const r=g(t,{name:e.name,description:e.description,priority:e.priority});await this.repository.update(r);const o=this.tasks.findIndex(a=>a.id===e.id);this.tasks[o]=r,this.render(),console.log("[App] Task updated:",e.id)}catch(t){console.error("[App] Failed to edit task:",t),alert(`修改任务失败：${t.message}`)}}async handleDeleteTask(e){try{await this.repository.delete(e),this.tasks=this.tasks.filter(t=>t.id!==e),this.render(),console.log("[App] Task deleted:",e)}catch(t){console.error("[App] Failed to delete task:",t),alert(`删除任务失败：${t.message}`)}}handleFilterChange({type:e,value:t}){e==="priority"?this.filters.priority=t:e==="dueDate"&&(this.filters.dueDate=t),this.render(),console.log("[App] Filters updated:",this.filters)}getFilteredTasks(){let e=[...this.tasks];if(this.filters.priority&&(e=e.filter(t=>t.priority===this.filters.priority)),this.filters.dueDate){const t=new Date().toISOString().split("T")[0],r=new Date(Date.now()+7*24*60*60*1e3).toISOString().split("T")[0];switch(this.filters.dueDate){case"today":e=e.filter(o=>o.dueDate===t);break;case"upcoming":e=e.filter(o=>o.dueDate&&o.dueDate>=t&&o.dueDate<=r);break;case"overdue":e=e.filter(o=>o.dueDate&&o.dueDate<t&&!o.completed);break;case"none":e=e.filter(o=>!o.dueDate);break}}return e.sort((t,r)=>r.createdAt-t.createdAt),e}render(){const e=document.querySelector("task-list");if(e){const t=this.getFilteredTasks();e.tasks=t}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{window.app=new b,window.app.init()}):(window.app=new b,window.app.init());
//# sourceMappingURL=main-BLY4O3q0.js.map
