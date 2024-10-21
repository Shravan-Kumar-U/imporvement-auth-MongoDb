const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String
});

const Todo = new Schema({
    discription: String,
    isDone: Boolean,
    userId: ObjectId    
})

const UserModel = mongoose.model("user", User);
const TodoModel = mongoose.model("todos", Todo);

module.exports = {
    UserModel,
    TodoModel
}