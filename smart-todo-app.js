/**
 * Smart Todo — core data layer (DOM-free).
 * Used by the browser UI and by Node tests.
 */
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.SmartTodoApp = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const STORAGE_KEYS = {
        todos: 'smart-todos',
        nextId: 'smart-nextId',
        insights: 'smart-insights'
    };

    const CATEGORIES = ['work', 'personal', 'health', 'learning', 'shopping'];
    const PRIORITIES = ['low', 'medium', 'high', 'critical'];

    const CATEGORY_KEYWORDS = {
        work: ['meeting', 'project', 'deadline', 'presentation', 'email', 'client', 'report', 'document', 'review', 'standup', 'invoice', 'budget', 'slack', 'pr'],
        personal: ['family', 'friend', 'home', 'hobby', 'vacation', 'birthday', 'anniversary', 'errand', 'chores', 'laundry', 'clean'],
        health: ['doctor', 'gym', 'exercise', 'medication', 'appointment', 'health', 'workout', 'diet', 'wellness', 'dentist', 'therapy', 'run', 'yoga'],
        learning: ['learn', 'study', 'course', 'book', 'tutorial', 'practice', 'skill', 'education', 'research', 'homework', 'exam', 'lecture'],
        shopping: ['buy', 'purchase', 'shop', 'order', 'grocery', 'groceries', 'store', 'market', 'amazon', 'delivery']
    };

    const TAG_CATEGORY = {
        work: 'work',
        personal: 'personal',
        health: 'health',
        fitness: 'health',
        workout: 'health',
        learning: 'learning',
        study: 'learning',
        shopping: 'shopping',
        groceries: 'shopping'
    };

    const PRIORITY_KEYWORDS = {
        critical: ['critical', 'emergency', 'urgent', 'asap'],
        high: ['important', 'deadline', 'priority', 'rush', 'today', 'must'],
        medium: ['soon', 'this week', 'needed', 'should'],
        low: ['someday', 'maybe', 'eventually', 'when possible', 'later']
    };

    const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function hasWord(text, phrase) {
        const escaped = escapeRegExp(phrase);
        if (phrase.indexOf(' ') !== -1) {
            return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
        }
        return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
    }

    function startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    class MemoryStorage {
        constructor() {
            this.map = Object.create(null);
        }
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(this.map, key) ? this.map[key] : null;
        }
        setItem(key, value) {
            this.map[key] = String(value);
        }
        removeItem(key) {
            delete this.map[key];
        }
    }

    class SmartTodoApp {
        constructor(storage) {
            this.storage = storage === undefined
                ? (typeof localStorage !== 'undefined' ? localStorage : new MemoryStorage())
                : storage;
            this.todos = [];
            this.nextId = 1;
            this.categories = CATEGORIES.slice();
            this.priorities = PRIORITIES.slice();
            this.insights = {
                totalCompleted: 0,
                totalTime: 0,
                productivityScore: 0
            };
            this.loadTodos();
        }

        analyzeTaskText(text) {
            const raw = String(text || '');
            const lower = raw.toLowerCase();
            const tags = this.extractTags(raw);

            const tieBreak = { health: 5, shopping: 4, learning: 3, work: 2, personal: 1 };
            let category = 'personal';
            let maxScore = 0;
            let bestTie = 0;
            for (const cat of CATEGORIES) {
                const words = CATEGORY_KEYWORDS[cat];
                const score = words.reduce((sum, word) => sum + (hasWord(lower, word) ? 1 : 0), 0);
                const tie = tieBreak[cat] || 0;
                if (score > maxScore || (score === maxScore && score > 0 && tie > bestTie)) {
                    maxScore = score;
                    bestTie = tie;
                    category = cat;
                }
            }

            for (const tag of tags) {
                if (TAG_CATEGORY[tag]) {
                    category = TAG_CATEGORY[tag];
                    break;
                }
            }

            let priority = 'medium';
            for (const prio of ['critical', 'high', 'medium', 'low']) {
                if (PRIORITY_KEYWORDS[prio].some((word) => hasWord(lower, word))) {
                    priority = prio;
                    break;
                }
            }

            if (tags.indexOf('urgent') !== -1 || tags.indexOf('critical') !== -1) {
                priority = 'critical';
            } else if (tags.indexOf('high') !== -1) {
                priority = 'high';
            } else if (tags.indexOf('low') !== -1) {
                priority = 'low';
            } else if (priority === 'medium' && hasWord(lower, 'today')) {
                priority = 'high';
            }

            const dueDate = this.parseDueDate(raw);
            const estimatedMinutes = this.estimateMinutes(raw, category);

            return {
                category: category,
                priority: priority,
                estimatedMinutes: estimatedMinutes,
                tags: tags,
                dueDate: dueDate
            };
        }

        estimateMinutes(text, category) {
            const lower = String(text || '').toLowerCase();
            if (hasWord(lower, 'quick') || hasWord(lower, 'quickly') || hasWord(lower, 'email')) {
                return 15;
            }
            if (hasWord(lower, 'meeting') || hasWord(lower, 'call')) {
                return 30;
            }
            if (hasWord(lower, 'workout') || hasWord(lower, 'gym') || hasWord(lower, 'run')) {
                return 60;
            }
            const defaults = {
                shopping: 45,
                health: 60,
                learning: 90,
                work: 45,
                personal: 30
            };
            let base = defaults[category] || 30;
            if (String(text || '').length > 80) {
                base += 15;
            }
            return Math.max(15, Math.min(180, base));
        }

        extractTags(text) {
            const tags = [];
            const tagRegex = /#([a-zA-Z0-9_-]+)/g;
            let match;
            const seen = Object.create(null);
            while ((match = tagRegex.exec(String(text || ''))) !== null) {
                const tag = match[1].toLowerCase();
                if (!seen[tag]) {
                    seen[tag] = true;
                    tags.push(tag);
                }
            }
            return tags;
        }

        parseDueDate(text, now) {
            const lower = String(text || '').toLowerCase();
            const origin = startOfDay(now || new Date());

            const iso = lower.match(/\b(\d{4}-\d{2}-\d{2})\b/);
            if (iso) {
                const parsed = startOfDay(iso[1] + 'T00:00:00');
                if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString();
                }
            }

            const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/);
            if (inDays) {
                const d = new Date(origin);
                d.setDate(d.getDate() + parseInt(inDays[1], 10));
                return d.toISOString();
            }

            if (hasWord(lower, 'today')) {
                return origin.toISOString();
            }
            if (hasWord(lower, 'tomorrow')) {
                const d = new Date(origin);
                d.setDate(d.getDate() + 1);
                return d.toISOString();
            }
            if (/\bnext week\b/.test(lower)) {
                const d = new Date(origin);
                d.setDate(d.getDate() + 7);
                return d.toISOString();
            }

            for (let i = 0; i < WEEKDAYS.length; i++) {
                if (hasWord(lower, WEEKDAYS[i])) {
                    const d = new Date(origin);
                    const diff = (i - d.getDay() + 7) % 7;
                    d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
                    return d.toISOString();
                }
            }

            return null;
        }

        generateTaskSuggestions(text) {
            const suggestions = [];
            const raw = String(text || '');
            const lower = raw.toLowerCase();

            if (raw.length > 80 || (raw.match(/\band\b/g) || []).length >= 2) {
                suggestions.push('Consider breaking this into smaller tasks');
            }
            if (!this.parseDueDate(raw) && !hasWord(lower, 'deadline') && !hasWord(lower, 'due')) {
                suggestions.push('Add a due date (try “tomorrow” or “Friday”)');
            }
            if (hasWord(lower, 'meeting') || hasWord(lower, 'call') || hasWord(lower, 'appointment')) {
                suggestions.push('Block time on your calendar');
            }
            return suggestions;
        }

        normalizeTodo(raw, fallbackId) {
            const text = String(raw && raw.text != null ? raw.text : '').trim();
            const analysis = text ? this.analyzeTaskText(text) : {
                category: 'personal',
                priority: 'medium',
                estimatedMinutes: 30,
                tags: [],
                dueDate: null
            };
            const id = Number(raw && raw.id);
            return {
                id: Number.isFinite(id) && id > 0 ? id : fallbackId,
                text: text,
                completed: Boolean(raw && raw.completed),
                category: CATEGORIES.indexOf(raw && raw.category) !== -1 ? raw.category : analysis.category,
                priority: PRIORITIES.indexOf(raw && raw.priority) !== -1 ? raw.priority : analysis.priority,
                estimatedMinutes: Number(raw && raw.estimatedMinutes) > 0 ? Number(raw.estimatedMinutes) : analysis.estimatedMinutes,
                actualMinutes: Math.max(0, Number(raw && raw.actualMinutes) || 0),
                tags: Array.isArray(raw && raw.tags) ? raw.tags.map(String) : analysis.tags,
                suggestions: Array.isArray(raw && raw.suggestions) ? raw.suggestions.map(String) : this.generateTaskSuggestions(text),
                dueDate: raw && raw.dueDate ? raw.dueDate : analysis.dueDate,
                createdAt: raw && raw.createdAt ? raw.createdAt : new Date().toISOString(),
                updatedAt: raw && raw.updatedAt ? raw.updatedAt : null,
                startTime: raw && raw.startTime ? raw.startTime : null,
                completedAt: raw && raw.completedAt ? raw.completedAt : null
            };
        }

        addTodo(text) {
            const trimmed = String(text || '').trim();
            if (!trimmed) {
                return null;
            }
            const analysis = this.analyzeTaskText(trimmed);
            const newTodo = {
                id: this.nextId++,
                text: trimmed,
                completed: false,
                category: analysis.category,
                priority: analysis.priority,
                estimatedMinutes: analysis.estimatedMinutes,
                actualMinutes: 0,
                tags: analysis.tags,
                suggestions: this.generateTaskSuggestions(trimmed),
                dueDate: analysis.dueDate,
                createdAt: new Date().toISOString(),
                updatedAt: null,
                startTime: null,
                completedAt: null
            };
            this.todos.unshift(newTodo);
            this.saveToLocalStorage();
            return clone(newTodo);
        }

        toggleTodo(id) {
            const todo = this.todos.find((t) => t.id === Number(id));
            if (!todo) {
                return null;
            }
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            if (todo.completed) {
                todo.completedAt = todo.updatedAt;
                if (todo.startTime) {
                    this.stopTimer(todo.id);
                }
            } else {
                todo.completedAt = null;
            }
            this.updateInsights();
            this.saveToLocalStorage();
            return clone(todo);
        }

        updateTodo(id, text) {
            const todo = this.todos.find((t) => t.id === Number(id));
            if (!todo) {
                return null;
            }
            const trimmed = String(text || '').trim();
            if (!trimmed) {
                return clone(todo);
            }
            const analysis = this.analyzeTaskText(trimmed);
            todo.text = trimmed;
            todo.category = analysis.category;
            todo.priority = analysis.priority;
            todo.estimatedMinutes = analysis.estimatedMinutes;
            todo.tags = analysis.tags;
            todo.suggestions = this.generateTaskSuggestions(trimmed);
            todo.dueDate = analysis.dueDate;
            todo.updatedAt = new Date().toISOString();
            this.saveToLocalStorage();
            return clone(todo);
        }

        deleteTodo(id) {
            const before = this.todos.length;
            this.todos = this.todos.filter((t) => t.id !== Number(id));
            if (this.todos.length === before) {
                return false;
            }
            this.updateInsights();
            this.saveToLocalStorage();
            return true;
        }

        clearCompleted() {
            const remaining = this.todos.filter((t) => !t.completed);
            const removed = this.todos.length - remaining.length;
            this.todos = remaining;
            this.updateInsights();
            this.saveToLocalStorage();
            return removed;
        }

        startTimer(id) {
            const todo = this.todos.find((t) => t.id === Number(id));
            if (!todo || todo.completed) {
                return null;
            }
            this.todos.forEach((other) => {
                if (other.id !== todo.id && other.startTime) {
                    this.stopTimer(other.id);
                }
            });
            todo.startTime = new Date().toISOString();
            todo.updatedAt = todo.startTime;
            this.saveToLocalStorage();
            return clone(todo);
        }

        stopTimer(id) {
            const todo = this.todos.find((t) => t.id === Number(id));
            if (!todo || !todo.startTime) {
                return null;
            }
            const elapsed = Math.max(1, Math.round((Date.now() - new Date(todo.startTime).getTime()) / 60000));
            todo.actualMinutes += elapsed;
            todo.startTime = null;
            todo.updatedAt = new Date().toISOString();
            this.updateInsights();
            this.saveToLocalStorage();
            return clone(todo);
        }

        getTodo(id) {
            const todo = this.todos.find((t) => t.id === Number(id));
            return todo ? clone(todo) : null;
        }

        getTodos() {
            return this.todos.map(clone);
        }

        filterTodos(options) {
            const opts = options || {};
            const status = opts.status || 'all';
            const category = opts.category || 'all';
            const priority = opts.priority || 'all';
            const query = String(opts.query || '').trim().toLowerCase();
            const sort = opts.sort || 'created';

            let list = this.todos.slice();
            if (status === 'active') {
                list = list.filter((t) => !t.completed);
            } else if (status === 'completed') {
                list = list.filter((t) => t.completed);
            }
            if (category !== 'all') {
                list = list.filter((t) => t.category === category);
            }
            if (priority !== 'all') {
                list = list.filter((t) => t.priority === priority);
            }
            if (query) {
                list = list.filter((t) => {
                    const haystack = (t.text + ' ' + (t.tags || []).join(' ') + ' ' + t.category).toLowerCase();
                    return haystack.indexOf(query) !== -1;
                });
            }

            const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
            list.sort((a, b) => {
                if (sort === 'priority') {
                    return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
                }
                if (sort === 'due') {
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            return list.map(clone);
        }

        getStats() {
            const total = this.todos.length;
            const completed = this.todos.filter((t) => t.completed).length;
            const active = total - completed;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            const categoryStats = {};
            const priorityStats = {};
            this.todos.forEach((todo) => {
                categoryStats[todo.category] = (categoryStats[todo.category] || 0) + 1;
                priorityStats[todo.priority] = (priorityStats[todo.priority] || 0) + 1;
            });
            const weights = { low: 1, medium: 2, high: 3, critical: 4 };
            const totalWeight = this.todos.reduce((sum, todo) => sum + (weights[todo.priority] || 2), 0);
            const avgWeight = total > 0 ? totalWeight / total : 0;
            const avgPriority = avgWeight <= 1.5 ? 'Low' : avgWeight <= 2.5 ? 'Medium' : avgWeight <= 3.5 ? 'High' : 'Critical';
            const overdue = this.todos.filter((t) => this.isOverdue(t)).length;
            const estimatedRemaining = this.todos
                .filter((t) => !t.completed)
                .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

            return {
                total: total,
                completed: completed,
                active: active,
                completionRate: completionRate,
                categoryStats: categoryStats,
                priorityStats: priorityStats,
                avgPriority: avgPriority,
                overdue: overdue,
                estimatedRemaining: estimatedRemaining,
                totalCompleted: this.insights.totalCompleted,
                totalTime: this.insights.totalTime,
                productivityScore: this.insights.productivityScore,
                tags: Array.from(new Set(this.todos.flatMap((t) => t.tags || []))),
                categories: Object.keys(categoryStats)
            };
        }

        isOverdue(todo) {
            if (!todo || !todo.dueDate || todo.completed) {
                return false;
            }
            return startOfDay(todo.dueDate) < startOfDay(new Date());
        }

        updateInsights() {
            const completedTodos = this.todos.filter((t) => t.completed);
            this.insights.totalCompleted = completedTodos.length;
            this.insights.totalTime = completedTodos.reduce((sum, t) => sum + (t.actualMinutes || 0), 0);
            let accuracyScore = 0;
            let validTasks = 0;
            completedTodos.forEach((todo) => {
                if (todo.actualMinutes > 0 && todo.estimatedMinutes > 0) {
                    const accuracy = 1 - Math.abs(todo.actualMinutes - todo.estimatedMinutes) / todo.estimatedMinutes;
                    accuracyScore += Math.max(0, accuracy);
                    validTasks++;
                }
            });
            this.insights.productivityScore = validTasks > 0 ? Math.round((accuracyScore / validTasks) * 100) : 0;
        }

        showInsights() {
            const stats = this.getStats();
            return {
                totalCompleted: stats.totalCompleted,
                categories: stats.categories,
                tags: stats.tags,
                totalTasks: stats.total,
                completedTasks: stats.completed,
                totalEstimatedTime: this.todos.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0)
            };
        }

        exportData() {
            return {
                todos: this.getTodos(),
                insights: clone(this.insights),
                exportDate: new Date().toISOString(),
                version: '3.0'
            };
        }

        importData(payload) {
            const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
            if (!data || !Array.isArray(data.todos)) {
                throw new Error('Invalid backup: expected an object with a todos array');
            }
            this.todos = data.todos.map((todo, index) => this.normalizeTodo(todo, index + 1));
            this.nextId = this.getNextId();
            if (data.insights && typeof data.insights === 'object') {
                this.insights = {
                    totalCompleted: Number(data.insights.totalCompleted) || 0,
                    totalTime: Number(data.insights.totalTime) || 0,
                    productivityScore: Number(data.insights.productivityScore) || 0
                };
            }
            this.updateInsights();
            this.saveToLocalStorage();
            return this.todos.length;
        }

        saveToLocalStorage() {
            if (!this.storage) {
                return;
            }
            try {
                this.storage.setItem(STORAGE_KEYS.todos, JSON.stringify(this.todos));
                this.storage.setItem(STORAGE_KEYS.nextId, String(this.nextId));
                this.storage.setItem(STORAGE_KEYS.insights, JSON.stringify(this.insights));
            } catch (error) {
                console.error('Failed to save todos:', error);
            }
        }

        loadTodos() {
            if (!this.storage) {
                return;
            }
            try {
                const stored = this.storage.getItem(STORAGE_KEYS.todos);
                const storedNextId = this.storage.getItem(STORAGE_KEYS.nextId);
                const storedInsights = this.storage.getItem(STORAGE_KEYS.insights);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        this.todos = parsed.map((todo, index) => this.normalizeTodo(todo, index + 1));
                        this.nextId = storedNextId ? parseInt(storedNextId, 10) : this.getNextId();
                        if (!Number.isFinite(this.nextId) || this.nextId <= 0) {
                            this.nextId = this.getNextId();
                        }
                    }
                }
                if (storedInsights) {
                    const insights = JSON.parse(storedInsights);
                    if (insights && typeof insights === 'object') {
                        this.insights = {
                            totalCompleted: Number(insights.totalCompleted) || 0,
                            totalTime: Number(insights.totalTime) || 0,
                            productivityScore: Number(insights.productivityScore) || 0
                        };
                    }
                }
                this.updateInsights();
            } catch (error) {
                console.error('Failed to load todos:', error);
                this.todos = [];
                this.nextId = 1;
            }
        }

        getNextId() {
            if (this.todos.length === 0) {
                return 1;
            }
            return Math.max.apply(null, this.todos.map((t) => t.id)) + 1;
        }
    }

    SmartTodoApp.MemoryStorage = MemoryStorage;
    SmartTodoApp.CATEGORIES = CATEGORIES;
    SmartTodoApp.PRIORITIES = PRIORITIES;
    return SmartTodoApp;
});
