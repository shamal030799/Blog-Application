const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilepic: {
        type: String,
        required: true
    },
    titles: {
        type: Array,
        required: true
    },
    urls: {
        type: Array,
        required: true
    },
    texts: {
        type: Array,
        required: true
    }
});

module.exports = User = mongoose.model("myUser", userSchema);