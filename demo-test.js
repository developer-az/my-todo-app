// Demo Test - Showcasing Smart Todo AI Features
const SmartTodoApp = require('./smart-todo-app.js');

console.log('🧠 Smart Todo - AI Feature Demo');
console.log('================================\n');

const app = new SmartTodoApp();

// Demo tasks from README examples
const demoTasks = [
    "Prepare quarterly report for board meeting #work important",
    "Review code changes and merge PR #development",
    "Schedule annual checkup with Dr. Smith #health",
    "Morning workout and protein shake #fitness #routine",
    "Complete JavaScript advanced course chapter 5 #learning #javascript",
    "Practice algorithm problems for interview prep #coding #career",
    "Buy birthday gift for mom #personal #family",
    "Grocery shopping: milk, bread, vegetables #shopping #weekly"
];

console.log('🤖 AI-Powered Smart Analysis Demo');
console.log('==================================\n');

demoTasks.forEach((task, index) => {
    console.log(`${index + 1}. Task: "${task}"`);
    
    const analysis = app.analyzeTaskText(task);
    const suggestions = app.generateTaskSuggestions(task);
    
    console.log(`   📂 Category: ${analysis.category}`);
    console.log(`   ⚡ Priority: ${analysis.priority}`);
    console.log(`   ⏱️  Estimated time: ${analysis.estimatedMinutes} minutes`);
    console.log(`   🏷️  Tags: ${analysis.tags.join(', ')}`);
    
    if (suggestions.length > 0) {
        console.log(`   💡 Suggestions:`);
        suggestions.forEach(suggestion => {
            console.log(`      - ${suggestion}`);
        });
    }
    
    console.log('');
});

console.log('📊 Adding all demo tasks to the app...\n');
demoTasks.forEach(task => {
    app.addTodo(task);
});

console.log('✅ All demo tasks added successfully!');
console.log(`📈 Total tasks: ${app.todos.length}`);

// Show category breakdown
console.log('\n📊 Category Breakdown:');
const categoryCount = {};
app.todos.forEach(todo => {
    categoryCount[todo.category] = (categoryCount[todo.category] || 0) + 1;
});
Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} tasks`);
});

// Show priority breakdown
console.log('\n⚡ Priority Breakdown:');
const priorityCount = {};
app.todos.forEach(todo => {
    priorityCount[todo.priority] = (priorityCount[todo.priority] || 0) + 1;
});
Object.entries(priorityCount).forEach(([priority, count]) => {
    console.log(`   ${priority}: ${count} tasks`);
});

// Show insights
const insights = app.showInsights();
console.log('\n📈 Productivity Insights:');
console.log(`   Total estimated time: ${insights.totalEstimatedTime} minutes`);
console.log(`   Unique tags used: ${insights.tags.length}`);
console.log(`   Categories covered: ${insights.categories.length}`);

console.log('\n🎉 Demo completed successfully!');
console.log('🌐 Open http://localhost:8000 to see the beautiful UI');
console.log('💡 Try adding your own tasks with hashtags and keywords!');
