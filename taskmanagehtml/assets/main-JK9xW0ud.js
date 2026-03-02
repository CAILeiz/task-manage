(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function r(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();const b="task-manager-db",y=1,f="tasks";async function x(){return new Promise((n,e)=>{const t=indexedDB.open(b,y);t.onerror=()=>{var r;e(new Error(`Failed to open database: ${(r=t.error)==null?void 0:r.message}`))},t.onsuccess=()=>{n(t.result)},t.onupgradeneeded=r=>{const a=r.target.result;if(!a.objectStoreNames.contains(f)){const o=a.createObjectStore(f,{keyPath:"id"});o.createIndex("priority","priority",{unique:!1}),o.createIndex("dueDate","dueDate",{unique:!1}),o.createIndex("completed","completed",{unique:!1}),o.createIndex("createdAt","createdAt",{unique:!1})}}})}let m=null;async function p(){return m||(m=await x(),m)}function w(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(n){const e=Math.random()*16|0;return(n==="x"?e:e&3|8).toString(16)})}function k(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID():w()}const g={HIGH:"HIGH",MEDIUM:"MEDIUM",LOW:"LOW"};function u(n){const e=[];return!n.name||typeof n.name!="string"?e.push("Name is required"):(n.name.trim().length===0||n.name.length>200)&&e.push("Name must be 1-200 characters"),n.description!==void 0&&n.description!==null&&(typeof n.description!="string"?e.push("Description must be a string"):n.description.length>100&&e.push("Description must be 100 characters or less")),[g.HIGH,g.MEDIUM,g.LOW].includes(n.priority)||e.push("Priority must be HIGH, MEDIUM, or LOW"),n.dueDate!==null&&n.dueDate!==void 0&&(E(n.dueDate)||e.push("dueDate must be ISO 8601 format (YYYY-MM-DD)")),typeof n.completed!="boolean"&&e.push("completed must be a boolean"),typeof n.createdAt!="number"&&e.push("createdAt must be a timestamp"),typeof n.updatedAt!="number"&&e.push("updatedAt must be a timestamp"),{valid:e.length===0,errors:e}}function E(n){if(!/^\d{4}-\d{2}-\d{2}$/.test(n))return!1;const e=new Date(n);return!isNaN(e.getTime())}function D({name:n,priority:e,description:t="",dueDate:r=null,completed:a=!1}){const o=Date.now(),s={id:k(),name:n.trim(),description:(t==null?void 0:t.trim())||"",priority:e,dueDate:r,completed:a,createdAt:o,updatedAt:o},i=u(s);if(!i.valid)throw new Error(`Invalid task: ${i.errors.join(", ")}`);return s}function h(n,e){const t={...n,...e,updatedAt:Date.now()},r=u(t);if(!r.valid)throw new Error(`Invalid task update: ${r.errors.join(", ")}`);return t}const c="tasks";class T{async create(e){const t=await p();return new Promise((r,a)=>{const o=u(e);if(!o.valid){a(new Error(`Validation failed: ${o.errors.join(", ")}`));return}const l=t.transaction(c,"readwrite").objectStore(c).add(e);l.onsuccess=()=>r(e),l.onerror=()=>{var d;return a(new Error(`Failed to create task: ${(d=l.error)==null?void 0:d.message}`))}})}async findAll(){const e=await p();return new Promise((t,r)=>{const s=e.transaction(c,"readonly").objectStore(c).getAll();s.onsuccess=()=>t(s.result),s.onerror=()=>{var i;return r(new Error(`Failed to find tasks: ${(i=s.error)==null?void 0:i.message}`))}})}async findById(e){const t=await p();return new Promise((r,a)=>{const i=t.transaction(c,"readonly").objectStore(c).get(e);i.onsuccess=()=>r(i.result||null),i.onerror=()=>{var l;return a(new Error(`Failed to find task: ${(l=i.error)==null?void 0:l.message}`))}})}async update(e){const t=await p();return new Promise((r,a)=>{const o=u(e);if(!o.valid){a(new Error(`Validation failed: ${o.errors.join(", ")}`));return}const l=t.transaction(c,"readwrite").objectStore(c).put(e);l.onsuccess=()=>r(e),l.onerror=()=>{var d;return a(new Error(`Failed to update task: ${(d=l.error)==null?void 0:d.message}`))}})}async delete(e){const t=await p();return new Promise((r,a)=>{const i=t.transaction(c,"readwrite").objectStore(c).delete(e);i.onsuccess=()=>r(),i.onerror=()=>{var l;return a(new Error(`Failed to delete task: ${(l=i.error)==null?void 0:l.message}`))}})}async findByPriority(e){const t=await p();return new Promise((r,a)=>{const l=t.transaction(c,"readonly").objectStore(c).index("priority").getAll(e);l.onsuccess=()=>r(l.result),l.onerror=()=>{var d;return a(new Error(`Failed to find tasks by priority: ${(d=l.error)==null?void 0:d.message}`))}})}async findByDueDate(e){const t=await this.findAll(),r=new Date;switch(r.setHours(0,0,0,0),e){case"today":return t.filter(a=>a.dueDate?new Date(a.dueDate).toDateString()===r.toDateString():!1);case"upcoming":{const a=new Date(r);return a.setDate(a.getDate()+7),t.filter(o=>{if(!o.dueDate)return!1;const s=new Date(o.dueDate);return s>=r&&s<=a})}case"overdue":return t.filter(a=>!a.dueDate||a.completed?!1:new Date(a.dueDate)<r);case"none":return t.filter(a=>!a.dueDate);default:throw new Error(`Unknown date filter: ${e}`)}}}class L extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._tasks=[],this._editingTaskId=null,this._activeFilter="all"}set tasks(e){this._tasks=e||[],this._activeFilter!=="all"&&this._tasks.length===0&&(this._activeFilter="all"),this.render()}get tasks(){return this._tasks}connectedCallback(){this.render()}render(){if(!this._tasks||this._tasks.length===0){this.renderEmpty(),this.attachEvents();return}this.shadowRoot.innerHTML=`
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
            <span class="stat-item all ${this._activeFilter==="all"?"active":""}" data-filter="all">
              📋 共 ${this._tasks.length} 个任务
            </span>
            <span class="stat-item completed ${this._activeFilter==="completed"?"active":""}" data-filter="completed">
              ✅ 已完成 ${this._tasks.filter(e=>e.completed).length}
            </span>
            <span class="stat-item pending ${this._activeFilter==="pending"?"active":""}" data-filter="pending">
              ⏳ 未完成 ${this._tasks.filter(e=>!e.completed).length}
            </span>
          </div>
        </div>
        <div class="task-items-container">
          ${this._tasks.map(e=>this.renderTaskItem(e)).join("")}
        </div>
      </div>
    `,this.attachEvents()}renderTaskListOnly(e){const t=this.shadowRoot.querySelector(".task-items-container");if(!t){console.error("[TaskList] task-items-container not found");return}if(!e||e.length===0){t.innerHTML=`
        <div class="empty-state" style="padding: 2rem; text-align: center; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
          <div style="font-size: 1.125rem;">暂无符合条件的任务</div>
        </div>
      `;return}t.innerHTML=e.map(r=>this.renderTaskItem(r)).join("")}updateActiveFilter(){this.shadowRoot.querySelectorAll(".stat-item").forEach(e=>{e.classList.remove("active"),e.dataset.filter===this._activeFilter&&e.classList.add("active")})}renderTaskItem(e){const t={HIGH:"高优先级",MEDIUM:"中优先级",LOW:"低优先级"},r={HIGH:"#ef4444",MEDIUM:"#f59e0b",LOW:"#10b981"},a=e.dueDate?e.dueDate:"无截止日期",o=e.dueDate&&!e.completed&&e.dueDate<new Date().toISOString().split("T")[0],s=new Date(e.createdAt),i=this.formatRelativeTime(s);return`
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
            <span class="due-date ${o?"overdue":""}">
              📅 ${a}
            </span>
            <span class="created-time">⏰ ${i}</span>
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
          <span class="stat-item all ${this._activeFilter==="all"?"active":""}" data-filter="all">
            📋 共 0 个任务
          </span>
          <span class="stat-item completed ${this._activeFilter==="completed"?"active":""}" data-filter="completed">
            ✅ 已完成 0
          </span>
          <span class="stat-item pending ${this._activeFilter==="pending"?"active":""}" data-filter="pending">
            ⏳ 未完成 0
          </span>
        </div>
      </div>

      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">暂无任务，创建一个吧！</div>
        <div class="empty-state-hint">点击上方"新建任务"按钮添加第一个任务</div>
      </div>
    `,this.attachEvents()}renderEditModal(e){var a;const t=((a=e.description)==null?void 0:a.length)||0,r=t>=100?"error":t>=80?"warning":"";return`
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
    `}attachEvents(){this.shadowRoot.addEventListener("click",e=>{console.log("[TaskList] Click event, target:",e.target.className);const t=e.target.closest(".toggle-complete"),r=e.target.closest(".edit-task"),a=e.target.closest(".delete-task"),o=e.target.closest('[data-action="close-modal"]'),s=e.target.closest(".stat-item");if(s){const i=s.dataset.filter;console.log("[TaskList] Stat item clicked, filter:",i),this.handleFilterClick(i);return}if(t){const i=t.dataset.taskId;console.log("[TaskList] Toggle button clicked, taskId:",i),this.dispatchEvent(new CustomEvent("task-toggle",{detail:{id:i},bubbles:!0,composed:!0}))}else if(r){const i=r.dataset.taskId,l=this._tasks.find(d=>d.id===i);l&&this.openEditModal(l)}else if(a){const i=a.dataset.taskId;confirm("确定要删除这个任务吗？")&&this.dispatchEvent(new CustomEvent("task-delete",{detail:{id:i},bubbles:!0,composed:!0}))}else o&&this.closeEditModal()}),this.shadowRoot.addEventListener("submit",e=>{e.target.id==="edit-task-form"&&(e.preventDefault(),this.handleEditSubmit(e.target))}),this.shadowRoot.addEventListener("input",e=>{if(e.target.id==="edit-description"){const t=e.target.value.length,r=this.shadowRoot.querySelector("#edit-desc-count");r&&(r.textContent=`${t}/100`,r.className=`char-count ${t>=100?"error":t>=80?"warning":""}`)}}),this.shadowRoot.addEventListener("click",e=>{e.target.classList.contains("modal-overlay")&&this.closeEditModal()})}handleFilterClick(e){console.log("[TaskList] handleFilterClick called with:",e),console.log("[TaskList] Current activeFilter:",this._activeFilter),console.log("[TaskList] Current tasks:",this._tasks);const t=this._activeFilter===e?"all":e;this._activeFilter=t,console.log("[TaskList] New activeFilter:",t);let r=[...this._tasks];t==="completed"?r=this._tasks.filter(a=>a.completed):t==="pending"&&(r=this._tasks.filter(a=>!a.completed)),console.log("[TaskList] Filtered tasks:",r),this.renderTaskListOnly(r),this.updateActiveFilter()}openEditModal(e){this._editingTaskId=e.id;const t=this.renderEditModal(e),o=new DOMParser().parseFromString(t,"text/html").querySelector(".modal-overlay");this.shadowRoot.appendChild(o);const s=this.shadowRoot.querySelector("#edit-name");s&&(s.focus(),s.select())}closeEditModal(){const e=this.shadowRoot.querySelector(".modal-overlay");e&&e.remove(),this._editingTaskId=null}handleEditSubmit(e){const t=new FormData(e),r={id:t.get("id"),name:t.get("name").trim(),description:t.get("description").trim(),priority:t.get("priority")};if(!r.name){alert("任务名称不能为空");return}console.log("[TaskList] Editing task:",r);const a=new CustomEvent("task-edit",{detail:r,bubbles:!0,composed:!0});this.dispatchEvent(a),console.log("[TaskList] Dispatched task-edit event"),this.closeEditModal()}formatRelativeTime(e){const r=new Date-e,a=Math.floor(r/6e4),o=Math.floor(r/36e5),s=Math.floor(r/864e5),i=String(e.getHours()).padStart(2,"0"),l=String(e.getMinutes()).padStart(2,"0"),d=`${i}:${l}`;return a<1?`刚刚 ${d}`:a<60?`${a} 分钟前 ${d}`:o<24?`今天 ${d}`:s<7?`${s} 天前 ${d}`:e.toLocaleDateString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit"})+` ${d}`}escapeHtml(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}}customElements.define("task-list",L);class S extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.render(),this.attachEvents()}render(){this.shadowRoot.innerHTML=`
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
    `}attachEvents(){const e=this.shadowRoot.querySelector("#priority-filter"),t=this.shadowRoot.querySelector("#due-date-filter");e.addEventListener("change",r=>{this.dispatchEvent(new CustomEvent("filter-change",{detail:{type:"priority",value:r.target.value},bubbles:!0,composed:!0}))}),t.addEventListener("change",r=>{this.dispatchEvent(new CustomEvent("filter-change",{detail:{type:"dueDate",value:r.target.value},bubbles:!0,composed:!0}))})}}customElements.define("filter-bar",S);class I extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._visible=!1,this._eventsAttached=!1}connectedCallback(){this.render()}show(){this._visible=!0,this._eventsAttached=!1,this.render(),this.attachEvents(),this.setDefaultValues(),setTimeout(()=>{const e=this.shadowRoot.querySelector("#task-name");e&&e.focus()},50)}hide(){this._visible=!1;const e=this._handleEsc;e&&document.removeEventListener("keydown",e),this.render()}setDefaultValues(){const e=this.shadowRoot.querySelector("#task-priority");e&&(e.value="HIGH");const t=this.shadowRoot.querySelector("#task-due-date");if(t){const r=new Date().toISOString().split("T")[0];t.value=r}}render(){if(!this._visible){this.shadowRoot.innerHTML="";return}this.shadowRoot.innerHTML=`
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
    `}attachEvents(){const e=this.shadowRoot.querySelector("form"),t=this.shadowRoot.querySelector("#task-description"),r=this.shadowRoot.querySelector("#desc-count"),a=this.shadowRoot.querySelector('[data-action="close"]'),o=this.shadowRoot.querySelector('[data-action="cancel"]'),s=this.shadowRoot.querySelector('[data-action="overlay"]');if(!e)return;t&&r&&t.addEventListener("input",()=>{const d=t.value.length;r.textContent=`${d}/100`,r.className=`char-count ${d>=100?"error":d>=80?"warning":""}`});const i=()=>{this.hide()};a&&a.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation(),i()}),o&&o.addEventListener("click",d=>{d.preventDefault(),d.stopPropagation(),i()}),s&&s.addEventListener("click",d=>{d.target===s&&i()}),e.addEventListener("submit",d=>{d.preventDefault(),this.handleSubmit()});const l=d=>{d.key==="Escape"&&(i(),document.removeEventListener("keydown",l),this._handleEsc=null)};document.addEventListener("keydown",l),this._handleEsc=l}handleSubmit(){const e=this.shadowRoot.querySelector("#task-name"),t=this.shadowRoot.querySelector("#task-description"),r=this.shadowRoot.querySelector("#task-priority"),a=this.shadowRoot.querySelector("#task-due-date"),o=this.shadowRoot.querySelector("#name-error");o&&(o.textContent="");const s=e.value.trim();if(!s){o&&(o.textContent="任务名称不能为空"),e.focus();return}const i={name:s,description:t.value.trim(),priority:r.value,dueDate:a.value||null};console.log("[TaskForm] Creating task:",i),this.dispatchEvent(new CustomEvent("task-create",{detail:i,bubbles:!0,composed:!0})),this.showToast("✅ 任务创建成功！"),this.resetForm(),this.hide()}showToast(e){const t=this.shadowRoot.querySelector(".toast");t&&t.remove();const r=document.createElement("div");r.className="toast",r.textContent=e,r.style.cssText=`
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
    `;const a=document.createElement("style");a.textContent=`
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `,this.shadowRoot.appendChild(a),this.shadowRoot.appendChild(r),setTimeout(()=>{r.style.animation="fadeOut 0.3s ease-out forwards",setTimeout(()=>r.remove(),300)},2500)}resetForm(){const e=this.shadowRoot.querySelector("form");e&&e.reset();const t=this.shadowRoot.querySelector("#desc-count");t&&(t.textContent="0/100")}}customElements.define("task-form",I);class v{constructor(){this.repository=new T,this.tasks=[],this.filters={priority:"",dueDate:"",status:""},this.taskForm=null}async init(){try{await this.loadTasks(),this.attachEvents(),this.render(),console.log("[App] Initialized successfully")}catch(e){console.error("[App] Initialization failed:",e)}}async loadTasks(){this.tasks=await this.repository.findAll(),console.log("[App] Loaded tasks:",this.tasks.length)}attachEvents(){this.taskForm=document.querySelector("task-form");const e=document.getElementById("add-task-btn");e&&e.addEventListener("click",()=>{console.log("[App] Add task button clicked"),this.taskForm&&this.taskForm.show()}),document.addEventListener("task-create",async r=>{console.log("[App] Received task-create event:",r.detail),await this.handleCreateTask(r.detail)});const t=()=>{const r=document.querySelector("task-list");r?(r.addEventListener("task-toggle",async a=>{await this.handleToggleTask(a.detail.id)}),r.addEventListener("task-edit",async a=>{await this.handleEditTask(a.detail)}),r.addEventListener("task-delete",async a=>{await this.handleDeleteTask(a.detail.id)}),console.log("[App] Task-list event listeners attached")):setTimeout(t,100)};t(),document.addEventListener("filter-change",r=>{this.handleFilterChange(r.detail)}),document.addEventListener("task-filter-change",r=>{this.handleStatusFilterChange(r.detail)})}async handleCreateTask(e){try{const t=D(e);await this.repository.create(t),this.tasks.push(t),this.render(),console.log("[App] Task created:",t.id)}catch(t){console.error("[App] Failed to create task:",t),alert(`创建任务失败：${t.message}`)}}async handleToggleTask(e){console.log("[App] handleToggleTask called with taskId:",e);try{const t=this.tasks.find(o=>o.id===e);if(!t){console.error("[App] Task not found:",e);return}console.log("[App] Found task:",t),console.log("[App] Current completed status:",t.completed);const r=h(t,{completed:!t.completed});console.log("[App] Updated task:",r),await this.repository.update(r),console.log("[App] Task saved to repository");const a=this.tasks.findIndex(o=>o.id===e);this.tasks[a]=r,console.log("[App] Local state updated"),this.render(),console.log("[App] Render called, task toggled:",e)}catch(t){console.error("[App] Failed to toggle task:",t)}}async handleEditTask(e){console.log("[App] Received task-edit:",e);try{const t=this.tasks.find(o=>o.id===e.id);if(!t){console.error("[App] Task not found:",e.id);return}const r=h(t,{name:e.name,description:e.description,priority:e.priority});await this.repository.update(r);const a=this.tasks.findIndex(o=>o.id===e.id);this.tasks[a]=r,this.render(),console.log("[App] Task updated:",e.id)}catch(t){console.error("[App] Failed to edit task:",t),alert(`修改任务失败：${t.message}`)}}async handleDeleteTask(e){try{await this.repository.delete(e),this.tasks=this.tasks.filter(t=>t.id!==e),this.render(),console.log("[App] Task deleted:",e)}catch(t){console.error("[App] Failed to delete task:",t),alert(`删除任务失败：${t.message}`)}}handleFilterChange({type:e,value:t}){e==="priority"?this.filters.priority=t:e==="dueDate"&&(this.filters.dueDate=t),this.render(),console.log("[App] Filters updated:",this.filters)}handleStatusFilterChange({status:e}){this.filters.status=e,this.render(),console.log("[App] Status filter updated:",this.filters)}getFilteredTasks(){let e=[...this.tasks];if(this.filters.status==="completed"?e=e.filter(t=>t.completed):this.filters.status==="pending"&&(e=e.filter(t=>!t.completed)),this.filters.priority&&(e=e.filter(t=>t.priority===this.filters.priority)),this.filters.dueDate){const t=new Date().toISOString().split("T")[0],r=new Date(Date.now()+7*24*60*60*1e3).toISOString().split("T")[0];switch(this.filters.dueDate){case"today":e=e.filter(a=>a.dueDate===t);break;case"upcoming":e=e.filter(a=>a.dueDate&&a.dueDate>=t&&a.dueDate<=r);break;case"overdue":e=e.filter(a=>a.dueDate&&a.dueDate<t&&!a.completed);break;case"none":e=e.filter(a=>!a.dueDate);break}}return e.sort((t,r)=>r.createdAt-t.createdAt),e}render(){const e=document.querySelector("task-list");if(e){const t=this.getFilteredTasks();e.tasks=t}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{window.app=new v,window.app.init()}):(window.app=new v,window.app.init());
//# sourceMappingURL=main-JK9xW0ud.js.map
