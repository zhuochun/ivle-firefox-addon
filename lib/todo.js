/// @filename todo.js
/// @author Wang Zhuochun
/// @last edit 31/Mar/2012 02:55 PM

// exports functions
exports.todo     = todo;
exports.todoList = todoList;

// prototypes
function todo(type, title, description, done) {
    this.id          = uuid();
    this.done        = done;
    this.type        = type;
    this.title       = title;
    this.description = description;
}

function todoList(token) {
    this.token = token;
    this.todos = [];

    // statistics about this todo list
    this.stats = {
        todoLeft      : 0,
        todoCompleted : 0,
        totalTodo     : 0
    };

    // update token for this todoList
    this.updateToken = function(newToken) {
        this.token = newToken;
    }

    // add a task to list
    this.add = function(task) {
        this.todos.push(task);
    };

    // edit a task in list
    this.edit = function(id, title) {
        for (var i = 0; i < this.todos.length; i++) {
            if (this.todos[i].id === id) {
                this.todos[i].title = title;
            }
        }
    };

    // retrieve a task by id
    this.find = function(id) {
        for (var i = 0; i < this.todos.length; i++) {
            if (this.todos[i].id === id) {
                return this.todos[i];
            }
        }
    };

    // remove a task from list
    this.remove = function(id) {
        for (var i = 0; i < this.todos.length; i++) {
            if (this.todos[i].id === id) {
                this.todos.splice(i, 1);
            }
        }
    };

    // remove tasks that are done
    this.removeDone = function() {
        for (var i = this.todos.length - 1; i >= 0; i--) {
            if (this.todos[i].done) {
                this.todos.splice(i, 1);
            }
        }
    };

}

// util functions
function uuid() {
    var uuid = "", i, random;

    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
}
