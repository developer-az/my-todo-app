// Test the JavaScript for syntax errors
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
    }

    // Smart Analysis Methods
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
        
        // Analyze category
        let category = 'personal';
        let maxScore = 0;
        
        for (const [cat, words] of Object.entries(keywords)) {
            const score = words.filter(word => lowerText.includes(word)).length;
            if (score > maxScore) {
                maxScore = score;
                category = cat;
            }
        }

        // Analyze priority
        let priority = 'medium';
        for (const [prio, words] of Object.entries(priorityKeywords)) {
            if (words.some(word => lowerText.includes(word))) {
                priority = prio;
                break;
            }
        }

        // Estimate time (basic heuristic)
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
        
        // Suggest breaking down complex tasks
        if (text.length > 50 || text.includes(' and ') || text.includes(',')) {
            suggestions.push("💡 Consider breaking this into smaller tasks");
        }
        
        // Suggest adding deadlines
        if (!lowerText.includes('deadline') && !lowerText.includes('due') && !lowerText.includes('by')) {
            suggestions.push("⏰ Consider adding a deadline");
        }
        
        // Suggest time blocking
        if (lowerText.includes('meeting') || lowerText.includes('call')) {
            suggestions.push("📅 Schedule this in your calendar");
        }
        
        return suggestions;
    }
}

// Test the analysis
const app = new SmartTodoApp();
const result = app.analyzeTaskText("Call doctor tomorrow #health urgent");
console.log("Analysis result:", result);