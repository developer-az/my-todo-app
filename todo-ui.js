(function () {
    'use strict';

    const CATEGORY_ICONS = {
        work: '💼',
        personal: '🏠',
        health: '🏥',
        learning: '📚',
        shopping: '🛒'
    };

    const PRIORITY_ICONS = {
        low: '🟢',
        medium: '🟡',
        high: '🟠',
        critical: '🔴'
    };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDueDate(iso) {
        if (!iso) return '';
        const due = new Date(iso);
        if (isNaN(due.getTime())) return '';
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDay = new Date(due);
        dueDay.setHours(0, 0, 0, 0);
        const diff = Math.round((dueDay - today) / 86400000);
        if (diff === 0) return 'Due today';
        if (diff === 1) return 'Due tomorrow';
        if (diff === -1) return 'Due yesterday';
        if (diff < 0) return 'Overdue by ' + Math.abs(diff) + ' day' + (Math.abs(diff) === 1 ? '' : 's');
        return 'Due ' + dueDay.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }

    class TodoUI {
        constructor(app) {
            this.app = app;
            this.status = 'all';
            this.category = 'all';
            this.priority = 'all';
            this.query = '';
            this.sort = 'created';
            this.editingId = null;
            this.bind();
            this.setupTheme();
            this.initParticles();
            this.render();
        }

        bind() {
            document.getElementById('addForm').addEventListener('submit', (event) => {
                event.preventDefault();
                this.addFromInput();
            });
            document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
            document.getElementById('insightsBtn').addEventListener('click', () => this.showInsights());
            document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
            document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
            document.getElementById('importFile').addEventListener('change', (event) => this.importFile(event));
            document.getElementById('clearCompleted').addEventListener('click', () => {
                this.app.clearCompleted();
                this.render();
            });
            document.getElementById('searchInput').addEventListener('input', (event) => {
                this.query = event.target.value;
                this.render();
            });
            document.getElementById('categoryFilter').addEventListener('change', (event) => {
                this.category = event.target.value;
                this.render();
            });
            document.getElementById('priorityFilter').addEventListener('change', (event) => {
                this.priority = event.target.value;
                this.render();
            });
            document.getElementById('sortFilter').addEventListener('change', (event) => {
                this.sort = event.target.value;
                this.render();
            });
            document.getElementById('filterTabs').addEventListener('click', (event) => {
                const button = event.target.closest('[data-filter]');
                if (!button) return;
                this.status = button.getAttribute('data-filter');
                this.render();
            });
            document.getElementById('todoList').addEventListener('click', (event) => this.onListClick(event));
            document.getElementById('todoList').addEventListener('dblclick', (event) => this.onListDblClick(event));
            document.getElementById('closeDashboard').addEventListener('click', () => this.hideInsights());
            document.getElementById('analyticsOverlay').addEventListener('click', (event) => {
                if (event.target.id === 'analyticsOverlay') this.hideInsights();
            });
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') this.hideInsights();
                if (event.key === '/' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                    event.preventDefault();
                    document.getElementById('searchInput').focus();
                }
            });
        }

        setupTheme() {
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = saved ? saved === 'dark' : prefersDark;
            document.body.classList.toggle('dark', isDark);
            document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
            document.getElementById('themeToggle').setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        }

        toggleTheme() {
            const isDark = document.body.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
            document.getElementById('themeToggle').setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        }

        addFromInput() {
            const input = document.getElementById('todoInput');
            const text = input.value.trim();
            if (!text) return;
            const todo = this.app.addTodo(text);
            input.value = '';
            input.focus();
            this.render();
            if (todo) this.showToast(todo);
        }

        onListClick(event) {
            const item = event.target.closest('.todo-item');
            if (!item) return;
            const id = Number(item.getAttribute('data-id'));
            const action = event.target.closest('[data-action]');
            if (!action) return;
            const name = action.getAttribute('data-action');
            if (name === 'toggle') this.app.toggleTodo(id);
            if (name === 'delete') this.app.deleteTodo(id);
            if (name === 'edit') this.startEdit(id);
            if (name === 'timer') {
                const todo = this.app.getTodo(id);
                if (todo && todo.startTime) this.app.stopTimer(id);
                else this.app.startTimer(id);
            }
            this.render();
        }

        onListDblClick(event) {
            const textEl = event.target.closest('.todo-text');
            if (!textEl) return;
            const item = event.target.closest('.todo-item');
            this.startEdit(Number(item.getAttribute('data-id')));
        }

        startEdit(id) {
            const todo = this.app.getTodo(id);
            if (!todo) return;
            this.editingId = id;
            this.render();
            const input = document.querySelector('.todo-edit');
            if (input) {
                input.focus();
                input.select();
                let done = false;
                const finish = (save) => {
                    if (done) return;
                    done = true;
                    if (save) this.app.updateTodo(id, input.value);
                    this.editingId = null;
                    this.render();
                };
                input.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') finish(true);
                    if (event.key === 'Escape') finish(false);
                });
                input.addEventListener('blur', () => finish(true));
            }
        }

        visibleTodos() {
            return this.app.filterTodos({
                status: this.status,
                category: this.category,
                priority: this.priority,
                query: this.query,
                sort: this.sort
            });
        }

        render() {
            const todos = this.visibleTodos();
            const list = document.getElementById('todoList');
            const empty = document.getElementById('emptyState');
            const stats = this.app.getStats();

            document.getElementById('todoCounter').textContent =
                stats.active + ' item' + (stats.active !== 1 ? 's' : '') + ' left';
            const clearBtn = document.getElementById('clearCompleted');
            clearBtn.hidden = stats.completed === 0;

            document.querySelectorAll('#filterTabs [data-filter]').forEach((button) => {
                button.setAttribute('aria-selected', button.getAttribute('data-filter') === this.status ? 'true' : 'false');
            });

            if (todos.length === 0) {
                list.innerHTML = '';
                empty.hidden = false;
                empty.querySelector('p').textContent = this.app.todos.length === 0
                    ? 'No todos yet. Add one above — try “Call doctor tomorrow #health urgent”.'
                    : 'No tasks match these filters.';
                return;
            }

            empty.hidden = true;
            list.innerHTML = todos.map((todo) => this.todoHtml(todo)).join('');
        }

        todoHtml(todo) {
            const overdue = this.app.isOverdue(todo);
            const dueLabel = formatDueDate(todo.dueDate);
            const dueClass = overdue ? 'due overdue' : (dueLabel === 'Due today' ? 'due today' : 'due');
            const tags = (todo.tags || []).map((tag) => '<span class="tag">#' + escapeHtml(tag) + '</span>').join('');
            const running = Boolean(todo.startTime);
            const body = this.editingId === todo.id
                ? '<input class="todo-edit" value="' + escapeHtml(todo.text) + '" aria-label="Edit task">'
                : '<div class="todo-text' + (todo.completed ? ' completed' : '') + '">' + escapeHtml(todo.text) + '</div>';

            return (
                '<article class="todo-item' + (overdue ? ' overdue' : '') + '" data-id="' + todo.id + '">' +
                    '<div class="todo-main">' +
                        '<button type="button" class="todo-checkbox" data-action="toggle" role="checkbox" aria-checked="' + todo.completed + '" aria-label="Mark ' + escapeHtml(todo.text) + (todo.completed ? ' active' : ' complete') + '">' +
                            (todo.completed ? '✓' : '') +
                        '</button>' +
                        '<div class="todo-body">' + body + '</div>' +
                        '<div class="todo-actions">' +
                            (!todo.completed ? '<button type="button" class="icon-btn" data-action="timer" title="' + (running ? 'Stop timer' : 'Start timer') + '" aria-label="' + (running ? 'Stop timer' : 'Start timer') + '">' + (running ? '⏹️' : '▶️') + '</button>' : '') +
                            '<button type="button" class="icon-btn" data-action="edit" title="Edit" aria-label="Edit task">✏️</button>' +
                            '<button type="button" class="icon-btn" data-action="delete" title="Delete" aria-label="Delete task">🗑️</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="todo-meta">' +
                        '<span class="pill">' + (CATEGORY_ICONS[todo.category] || '📋') + ' ' + escapeHtml(todo.category) + '</span>' +
                        '<span class="pill priority-' + escapeHtml(todo.priority) + '">' + (PRIORITY_ICONS[todo.priority] || '') + ' ' + escapeHtml(todo.priority) + '</span>' +
                        (dueLabel ? '<span class="' + dueClass + '">📅 ' + escapeHtml(dueLabel) + '</span>' : '') +
                        (todo.estimatedMinutes ? '<span>~' + todo.estimatedMinutes + 'm</span>' : '') +
                        (todo.actualMinutes ? '<span>tracked ' + todo.actualMinutes + 'm</span>' : '') +
                        (running ? '<span aria-live="polite">● timing</span>' : '') +
                        tags +
                    '</div>' +
                '</article>'
            );
        }

        showToast(todo) {
            document.querySelectorAll('.toast').forEach((node) => node.remove());
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.setAttribute('role', 'status');
            const suggestions = (todo.suggestions || []).map((s) => '<div>' + escapeHtml(s) + '</div>').join('');
            toast.innerHTML =
                '<div class="toast-header"><strong>Smart analysis</strong><button type="button" class="icon-btn" aria-label="Dismiss">✕</button></div>' +
                '<div>📂 ' + escapeHtml(todo.category) + ' · ⚡ ' + escapeHtml(todo.priority) + ' · ⏱️ ' + todo.estimatedMinutes + ' min</div>' +
                (todo.dueDate ? '<div>📅 ' + escapeHtml(formatDueDate(todo.dueDate)) + '</div>' : '') +
                (suggestions ? '<div style="margin-top:8px">' + suggestions + '</div>' : '');
            toast.querySelector('button').addEventListener('click', () => toast.remove());
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 6000);
        }

        showInsights() {
            const stats = this.app.getStats();
            document.getElementById('completedCount').textContent = String(stats.completed);
            document.getElementById('completionRate').textContent = stats.completionRate + '%';
            document.getElementById('avgPriority').textContent = stats.avgPriority;
            document.getElementById('categoryCount').textContent = String(stats.categories.length);
            document.getElementById('overdueCount').textContent = String(stats.overdue);
            document.getElementById('timeLeft').textContent = stats.estimatedRemaining + 'm';
            this.drawChart('categoryChart', stats.categoryStats, CATEGORY_ICONS);
            this.drawChart('priorityChart', stats.priorityStats, PRIORITY_ICONS);
            const overlay = document.getElementById('analyticsOverlay');
            overlay.classList.add('open');
            document.getElementById('closeDashboard').focus();
        }

        hideInsights() {
            document.getElementById('analyticsOverlay').classList.remove('open');
        }

        drawChart(id, data, icons) {
            const container = document.getElementById(id);
            const values = Object.values(data || {});
            const total = values.reduce((sum, n) => sum + n, 0);
            if (!total) {
                container.innerHTML = '<p class="dashboard-sub">No data yet.</p>';
                return;
            }
            const maxValue = Math.max.apply(null, values);
            container.innerHTML = Object.keys(data).map((key) => {
                const width = (data[key] / maxValue) * 100;
                return (
                    '<div class="chart-bar">' +
                        '<div class="chart-label">' + (icons[key] || '') + ' ' + escapeHtml(key) + '</div>' +
                        '<div class="chart-track"><div class="chart-fill" style="width:' + width + '%"></div></div>' +
                        '<div>' + data[key] + '</div>' +
                    '</div>'
                );
            }).join('');
        }

        exportData() {
            const payload = this.app.exportData();
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'smart-todos-' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }

        importFile(event) {
            const file = event.target.files && event.target.files[0];
            event.target.value = '';
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    this.app.importData(String(reader.result || ''));
                    this.render();
                } catch (error) {
                    window.alert('Could not import that file. Use a backup exported from this app.');
                }
            };
            reader.readAsText(file);
        }

        initParticles() {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const root = document.getElementById('particles');
            if (!root) return;
            const count = window.innerWidth < 700 ? 8 : 16;
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 5 + 3;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 18 + 's';
                particle.style.animationDuration = 14 + Math.random() * 12 + 's';
                root.appendChild(particle);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        window.app = new TodoUI(new SmartTodoApp());
    });
})();
