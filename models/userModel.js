const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", function (next) {
  let user = this;

  bcryptjs
    .genSalt()
    .then((salt) => {
      bcryptjs
        .hash(user.password, salt)
        .then((hashedPwd) => {
          user.password = hashedPwd;
          next();
        })
        .catch((err) => {
          console.log(`Error occurred when hashing ... ${err}`);
        });
    })
    .catch((err) => {
      console.log(`Error occurred when salting ... ${err}`);
    });
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
