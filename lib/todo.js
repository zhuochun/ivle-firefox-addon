/// @filename todo.js
/// @author Wang Zhuochun
/// @last edit 31/Mar/2012 02:55 PM

// exports functions
exports.todo     = todo;
exports.todoList = todoList;

// todo prototypes
function todo(type, title, done) {
    this.id          = uuid();
    this.type        = type;
    this.title       = title;
    this.done        = done;
}

// todo list prototypes
function todoList(token) {
    this.token = token;
    this.todos = [];

    // statistics about this todo list
    this.stats = {
        todoLeft      : 0,
        todoCompleted : 0,
        todoTotal     : 0
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
