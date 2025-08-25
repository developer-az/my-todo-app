// Smart Todo App - Standalone JavaScript Class
class SmartTodoApp {
    constructor() {
        this.todos = [];
        this.nextId = 1;
        this.categories = ['work', 'personal', 'health', 'learning', 'shopping', 'urgent'];
        this.priorities = ['low', 'medium', 'high', 'critical'];
        this.insights = {
            totalCompleted: 0,
            totalTime: 0,
            productivityScore: 0
        };
        this.init();
    }

    init() {
        this.loadTodos();
    }

    analyzeTaskText(text) {
        const keywords = {
            work: ['meeting', 'project', 'deadline', 'presentation', 'email', 'call', 'client', 'report', 'document', 'review'],
            personal: ['family', 'friend', 'home', 'personal', 'self', 'hobby', 'vacation', 'birthday', 'anniversary'],
            health: ['doctor', 'gym', 'exercise', 'medication', 'appointment', 'health', 'workout', 'diet', 'wellness'],
            learning: ['learn', 'study', 'course', 'book', 'tutorial', 'practice', 'skill', 'education', 'research'],
            shopping: ['buy', 'purchase', 'shop', 'order', 'grocery', 'store', 'market', 'amazon', 'delivery'],
            urgent: ['urgent', 'asap', 'emergency', 'critical', 'deadline', 'important', 'priority', 'rush', 'today']
        };

        const priorityKeywords = {
            critical: ['critical', 'emergency', 'urgent', 'asap'],
            high: ['important', 'deadline', 'priority', 'rush', 'today'],
            medium: ['soon', 'this week', 'needed', 'should'],
            low: ['someday', 'maybe', 'eventually', 'when possible']
        };

        const lowerText = text.toLowerCase();
        
        let category = 'personal';
        let maxScore = 0;
        
        for (const [cat, words] of Object.entries(keywords)) {
            const score = words.filter(word => lowerText.includes(word)).length;
            if (score > maxScore) {
                maxScore = score;
                category = cat;
            }
        }

        let priority = 'medium';
        for (const [prio, words] of Object.entries(priorityKeywords)) {
            if (words.some(word => lowerText.includes(word))) {
                priority = prio;
                break;
            }
        }

        const wordCount = text.split(' ').length;
        let estimatedMinutes = Math.max(15, Math.min(120, wordCount * 10));
        
        return {
            category,
            priority,
            estimatedMinutes,
            tags: this.extractTags(text)
        };
    }

    extractTags(text) {
        const tags = [];
        const tagRegex = /#(\w+)/g;
        let match;
        while ((match = tagRegex.exec(text)) !== null) {
            tags.push(match[1].toLowerCase());
        }
        return tags;
    }

    generateTaskSuggestions(text) {
        const suggestions = [];
        const lowerText = text.toLowerCase();
        
        if (text.length > 50 || text.includes(' and ') || text.includes(',')) {
            suggestions.push("💡 Consider breaking this into smaller tasks");
        }
        
        if (!lowerText.includes('deadline') && !lowerText.includes('due') && !lowerText.includes('by')) {
            suggestions.push("⏰ Consider adding a deadline");
        }
        
        if (lowerText.includes('meeting') || lowerText.includes('call')) {
            suggestions.push("📅 Schedule this in your calendar");
        }
        
        return suggestions;
    }

    addTodo(text) {
        const analysis = this.analyzeTaskText(text);
        const newTodo = {
            id: this.nextId++,
            text: text.trim(),
            completed: false,
            category: analysis.category,
            priority: analysis.priority,
            estimatedMinutes: analysis.estimatedMinutes,
            actualMinutes: 0,
            tags: analysis.tags,
            suggestions: this.generateTaskSuggestions(text),
            createdAt: new Date().toISOString(),
            startTime: null,
            completedAt: null
        };

        this.todos.unshift(newTodo);
        this.saveToLocalStorage();
        return newTodo;
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            if (todo.completed) {
                todo.completedAt = new Date().toISOString();
                this.insights.totalCompleted++;
            } else {
                todo.completedAt = null;
                if (this.insights.totalCompleted > 0) {
                    this.insights.totalCompleted--;
                }
            }
            this.saveToLocalStorage();
            return todo;
        }
        return null;
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveToLocalStorage();
    }

    clearCompleted() {
        this.todos = this.todos.filter(t => !t.completed);
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('smart-todos', JSON.stringify(this.todos));
                localStorage.setItem('smart-nextId', this.nextId.toString());
                localStorage.setItem('smart-insights', JSON.stringify(this.insights));
            }
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    loadTodos() {
        try {
            if (typeof localStorage !== 'undefined') {
                const stored = localStorage.getItem('smart-todos');
                const storedNextId = localStorage.getItem('smart-nextId');
                const storedInsights = localStorage.getItem('smart-insights');
                
                if (stored) {
                    this.todos = JSON.parse(stored);
                    this.nextId = storedNextId ? parseInt(storedNextId) : this.getNextId();
                }
                
                if (storedInsights) {
                    this.insights = JSON.parse(storedInsights);
                }
            }
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
        }
    }

    getNextId() {
        if (this.todos.length === 0) return 1;
        return Math.max(...this.todos.map(t => t.id)) + 1;
    }

    showInsights() {
        return {
            totalCompleted: this.insights.totalCompleted,
            categories: [...new Set(this.todos.map(t => t.category))],
            tags: [...new Set(this.todos.flatMap(t => t.tags))],
            totalTasks: this.todos.length,
            completedTasks: this.todos.filter(t => t.completed).length,
            totalEstimatedTime: this.todos.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0)
        };
    }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartTodoApp;
}
