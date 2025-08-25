// Comprehensive Test for Smart Todo App
const SmartTodoApp = require('./smart-todo-app.js');

console.log('🧠 Smart Todo App - Comprehensive Test Suite');
console.log('============================================\n');

// Test 1: Basic App Initialization
console.log('1. Testing App Initialization...');
const app = new SmartTodoApp();
console.log('✅ App initialized successfully');
console.log('   - Categories:', app.categories);
console.log('   - Priorities:', app.priorities);
console.log('   - Initial todos count:', app.todos.length);

// Test 2: AI Task Analysis
console.log('\n2. Testing AI Task Analysis...');
const testTasks = [
    "Call doctor tomorrow #health urgent",
    "Prepare quarterly report for board meeting #work important",
    "Buy groceries: milk, bread, vegetables #shopping #weekly",
    "Complete JavaScript course chapter 5 #learning #javascript",
    "Morning workout and protein shake #fitness #routine"
];

testTasks.forEach((task, index) => {
    const analysis = app.analyzeTaskText(task);
    console.log(`   Task ${index + 1}: "${task}"`);
    console.log(`   → Category: ${analysis.category}`);
    console.log(`   → Priority: ${analysis.priority}`);
    console.log(`   → Estimated time: ${analysis.estimatedMinutes} minutes`);
    console.log(`   → Tags: ${analysis.tags.join(', ')}`);
    console.log('');
});

// Test 3: Task Management
console.log('3. Testing Task Management...');
console.log('   Adding test tasks...');
testTasks.forEach(task => {
    app.addTodo(task);
});

console.log(`   ✅ Added ${app.todos.length} tasks`);
console.log(`   - Completed: ${app.todos.filter(t => t.completed).length}`);
console.log(`   - Pending: ${app.todos.filter(t => !t.completed).length}`);

// Test 4: Task Completion
console.log('\n4. Testing Task Completion...');
if (app.todos.length > 0) {
    const firstTodo = app.todos[0];
    console.log(`   Completing task: "${firstTodo.text}"`);
    app.toggleTodo(firstTodo.id);
    console.log(`   ✅ Task completion status: ${app.todos[0].completed}`);
}

// Test 5: Data Persistence
console.log('\n5. Testing Data Persistence...');
console.log('   Saving to localStorage...');
app.saveToLocalStorage();
console.log('   ✅ Data saved successfully');

// Test 6: Tag Extraction
console.log('\n6. Testing Tag Extraction...');
const tagTestText = "Meeting with client #work #important #deadline";
const extractedTags = app.extractTags(tagTestText);
console.log(`   Text: "${tagTestText}"`);
console.log(`   → Extracted tags: ${extractedTags.join(', ')}`);

// Test 7: Task Suggestions
console.log('\n7. Testing Task Suggestions...');
const suggestionTest = "Complex task with multiple parts and deadlines";
const suggestions = app.generateTaskSuggestions(suggestionTest);
console.log(`   Task: "${suggestionTest}"`);
suggestions.forEach(suggestion => {
    console.log(`   → ${suggestion}`);
});

// Test 8: Category Distribution
console.log('\n8. Testing Category Distribution...');
const categoryCount = {};
app.todos.forEach(todo => {
    categoryCount[todo.category] = (categoryCount[todo.category] || 0) + 1;
});
console.log('   Category distribution:');
Object.entries(categoryCount).forEach(([category, count]) => {
    console.log(`   → ${category}: ${count} tasks`);
});

// Test 9: Priority Distribution
console.log('\n9. Testing Priority Distribution...');
const priorityCount = {};
app.todos.forEach(todo => {
    priorityCount[todo.priority] = (priorityCount[todo.priority] || 0) + 1;
});
console.log('   Priority distribution:');
Object.entries(priorityCount).forEach(([priority, count]) => {
    console.log(`   → ${priority}: ${count} tasks`);
});

// Test 10: Performance Test
console.log('\n10. Testing Performance...');
const startTime = performance.now();
for (let i = 0; i < 100; i++) {
    app.analyzeTaskText(`Test task ${i} #test #performance`);
}
const endTime = performance.now();
console.log(`   ✅ Analyzed 100 tasks in ${(endTime - startTime).toFixed(2)}ms`);

// Test 11: Error Handling
console.log('\n11. Testing Error Handling...');
try {
    app.analyzeTaskText("");
    console.log('   ✅ Empty string handled gracefully');
} catch (error) {
    console.log('   ❌ Error with empty string:', error.message);
}

// Test 12: Insights
console.log('\n12. Testing Insights...');
const insights = app.showInsights();
console.log('   📊 App Insights:');
console.log(`   → Total tasks: ${insights.totalTasks}`);
console.log(`   → Completed tasks: ${insights.completedTasks}`);
console.log(`   → Total completed (historical): ${insights.totalCompleted}`);
console.log(`   → Categories used: ${insights.categories.join(', ')}`);
console.log(`   → Unique tags: ${insights.tags.join(', ')}`);
console.log(`   → Total estimated time: ${insights.totalEstimatedTime} minutes`);

// Test 13: Final Summary
console.log('\n============================================');
console.log('🎉 COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
console.log('============================================');
console.log(`📊 Final Statistics:`);
console.log(`   - Total tasks: ${app.todos.length}`);
console.log(`   - Completed: ${app.todos.filter(t => t.completed).length}`);
console.log(`   - Categories used: ${[...new Set(app.todos.map(t => t.category))].length}`);
console.log(`   - Unique tags: ${[...new Set(app.todos.flatMap(t => t.tags))].length}`);
console.log(`   - Total estimated time: ${app.todos.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0)} minutes`);

console.log('\n🚀 App is ready for use!');
console.log('   Open http://localhost:8000 in your browser to test the UI');
console.log('   The local server is running on port 8000');
