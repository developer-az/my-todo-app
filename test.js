'use strict';

const SmartTodoApp = require('./smart-todo-app.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed += 1;
        console.log('  ✓ ' + message);
    } else {
        failed += 1;
        console.error('  ✗ ' + message);
    }
}

function assertEqual(actual, expected, message) {
    const ok = actual === expected;
    if (!ok) {
        console.error('    expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    }
    assert(ok, message);
}

function assertDeepEqual(actual, expected, message) {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) {
        console.error('    expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
    }
    assert(ok, message);
}

function createApp() {
    return new SmartTodoApp(new SmartTodoApp.MemoryStorage());
}

function frozenNow() {
    return new Date('2026-08-25T15:00:00');
}

console.log('Smart Todo — test suite\n');

console.log('1. Initialization');
{
    const app = createApp();
    assertEqual(app.todos.length, 0, 'starts empty');
    assertEqual(app.nextId, 1, 'nextId starts at 1');
    assertDeepEqual(app.categories, ['work', 'personal', 'health', 'learning', 'shopping'], 'categories exclude fake “urgent” bucket');
}

console.log('\n2. Adding and rejecting empty tasks');
{
    const app = createApp();
    assertEqual(app.addTodo('   '), null, 'blank input is rejected');
    assertEqual(app.addTodo(''), null, 'empty string is rejected');
    const added = app.addTodo('  Buy milk  ');
    assertEqual(added.text, 'Buy milk', 'trims whitespace');
    assertEqual(app.todos.length, 1, 'stores the task');
    assertEqual(app.nextId, 2, 'increments nextId');
}

console.log('\n3. Category and priority analysis');
{
    const app = createApp();
    const health = app.analyzeTaskText('Call doctor tomorrow #health urgent');
    assertEqual(health.category, 'health', 'doctor + #health → health');
    assertEqual(health.priority, 'critical', 'urgent → critical');
    assertDeepEqual(health.tags, ['health'], 'extracts #health');
    assert(health.dueDate != null, 'parses tomorrow as a due date');

    const work = app.analyzeTaskText('Prepare quarterly report for board meeting #work important');
    assertEqual(work.category, 'work', 'meeting + #work → work');
    assertEqual(work.priority, 'high', 'important → high');

    const shopping = app.analyzeTaskText('Grocery shopping: milk, bread, vegetables #shopping #weekly');
    assertEqual(shopping.category, 'shopping', 'grocery + #shopping → shopping');

    const learning = app.analyzeTaskText('Complete JavaScript course chapter 5 #learning');
    assertEqual(learning.category, 'learning', '#learning wins');

    const callback = app.analyzeTaskText('Write a callback function');
    assertEqual(callback.category, 'personal', 'substring “call” inside callback should not force work');
    const callbackHasCallWord = app.analyzeTaskText('Call the client about the contract');
    assertEqual(callbackHasCallWord.category, 'work', 'standalone “call” still maps to work');
    const doctorCall = app.analyzeTaskText('Call doctor tomorrow');
    assertEqual(doctorCall.category, 'health', 'call + doctor prefers health over work');
}

console.log('\n4. Word-boundary matching');
{
    const app = createApp();
    const homework = app.analyzeTaskText('Finish homework for class');
    assertEqual(homework.category, 'learning', 'homework maps to learning, not personal/home');
}

console.log('\n5. Due dates');
{
    const app = createApp();
    const today = app.parseDueDate('finish this today', frozenNow());
    assert(today.indexOf('2026-08-25') === 0, 'today → Aug 25');

    const tomorrow = app.parseDueDate('call doctor tomorrow', frozenNow());
    assert(tomorrow.indexOf('2026-08-26') === 0, 'tomorrow → Aug 26');

    const friday = app.parseDueDate('ship it Friday', frozenNow());
    assert(friday.indexOf('2026-08-28') === 0, 'Friday from Tuesday Aug 25 → Aug 28');

    const iso = app.parseDueDate('due 2026-09-01', frozenNow());
    assert(iso.indexOf('2026-09-01') === 0, 'ISO date');

    const inDays = app.parseDueDate('follow up in 3 days', frozenNow());
    assert(inDays.indexOf('2026-08-28') === 0, 'in 3 days');

    assertEqual(app.parseDueDate('no date here', frozenNow()), null, 'returns null when no date found');
}

console.log('\n6. CRUD, toggle, clear');
{
    const app = createApp();
    const a = app.addTodo('Task A #work');
    const b = app.addTodo('Task B #personal');
    assertEqual(app.todos[0].id, b.id, 'new tasks are prepended');
    app.toggleTodo(a.id);
    assertEqual(app.getTodo(a.id).completed, true, 'toggle completes');
    assert(app.getTodo(a.id).completedAt != null, 'sets completedAt');
    app.toggleTodo(a.id);
    assertEqual(app.getTodo(a.id).completed, false, 'toggle restores');
    assertEqual(app.getTodo(a.id).completedAt, null, 'clears completedAt');
    app.toggleTodo(a.id);
    assertEqual(app.clearCompleted(), 1, 'clearCompleted removes finished tasks');
    assertEqual(app.todos.length, 1, 'active task remains');
    assert(app.deleteTodo(b.id), 'delete returns true');
    assertEqual(app.todos.length, 0, 'list is empty after delete');
    assertEqual(app.deleteTodo(999), false, 'deleting missing id returns false');
}

console.log('\n7. Edit re-analyzes text');
{
    const app = createApp();
    const todo = app.addTodo('Buy milk');
    const updated = app.updateTodo(todo.id, 'Study for the exam tomorrow #learning');
    assertEqual(updated.category, 'learning', 'edit updates category');
    assert(updated.dueDate != null, 'edit updates due date');
    assert(updated.tags.indexOf('learning') !== -1, 'edit updates tags');
    const blank = app.updateTodo(todo.id, '   ');
    assertEqual(blank.text, 'Study for the exam tomorrow #learning', 'blank edit keeps original text');
}

console.log('\n8. Filters, search, sort');
{
    const app = createApp();
    app.addTodo('Critical prod outage #work urgent');
    app.addTodo('Buy groceries #shopping');
    const learning = app.addTodo('Read a book #learning someday');
    app.toggleTodo(learning.id);

    assertEqual(app.filterTodos({ status: 'active' }).length, 2, 'active filter');
    assertEqual(app.filterTodos({ status: 'completed' }).length, 1, 'completed filter');
    assertEqual(app.filterTodos({ category: 'work' }).length, 1, 'category filter');
    assertEqual(app.filterTodos({ query: 'groc' }).length, 1, 'search matches text');
    const byPriority = app.filterTodos({ sort: 'priority', status: 'active' });
    assertEqual(byPriority[0].priority, 'critical', 'priority sort puts critical first');
}

console.log('\n9. Persistence round-trip');
{
    const storage = new SmartTodoApp.MemoryStorage();
    const app = new SmartTodoApp(storage);
    app.addTodo('Persist me #work important');
    const restored = new SmartTodoApp(storage);
    assertEqual(restored.todos.length, 1, 'reloads todos');
    assertEqual(restored.todos[0].text, 'Persist me #work important', 'preserves text');
    assertEqual(restored.nextId, 2, 'preserves nextId');
}

console.log('\n10. Export / import');
{
    const app = createApp();
    app.addTodo('Exported task #health');
    const payload = app.exportData();
    assert(Array.isArray(payload.todos), 'export includes todos');
    const other = createApp();
    const count = other.importData(payload);
    assertEqual(count, 1, 'import restores count');
    assertEqual(other.todos[0].text, 'Exported task #health', 'import preserves text');
    let threw = false;
    try {
        other.importData({ nope: true });
    } catch (error) {
        threw = true;
    }
    assert(threw, 'invalid backup throws');
}

console.log('\n11. XSS payload is stored as plain text');
{
    const app = createApp();
    const evil = app.addTodo('<img src=x onerror="alert(1)"> #work');
    assertEqual(evil.text, '<img src=x onerror="alert(1)"> #work', 'does not strip or interpret HTML');
}

console.log('\n12. Stats and overdue');
{
    const app = createApp();
    const overdue = app.addTodo('Pay rent 2020-01-01 #personal');
    app.addTodo('Future work 2099-01-01 #work');
    const stats = app.getStats();
    assertEqual(stats.total, 2, 'stats total');
    assertEqual(stats.active, 2, 'stats active');
    assertEqual(stats.overdue, 1, 'detects overdue task');
    assert(app.isOverdue(overdue), 'isOverdue true for past due incomplete task');
    app.toggleTodo(overdue.id);
    assertEqual(app.isOverdue(app.getTodo(overdue.id)), false, 'completed tasks are not overdue');
}

console.log('\n13. Time estimates are category-based, not word-count');
{
    const app = createApp();
    const email = app.analyzeTaskText('Send a quick email to the client');
    assertEqual(email.estimatedMinutes, 15, 'quick email → 15 minutes');
    const workout = app.analyzeTaskText('Morning gym workout');
    assertEqual(workout.estimatedMinutes, 60, 'workout → 60 minutes');
}

console.log('\n14. Insights helper');
{
    const app = createApp();
    app.addTodo('A #work');
    app.addTodo('B #health');
    const insights = app.showInsights();
    assertEqual(insights.totalTasks, 2, 'insights totalTasks');
    assert(insights.categories.indexOf('work') !== -1, 'insights includes work');
}

console.log('\n============================================');
console.log('Passed: ' + passed + '  Failed: ' + failed);
console.log('============================================');

if (failed > 0) {
    process.exit(1);
}
