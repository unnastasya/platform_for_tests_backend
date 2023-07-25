const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		surname: { type: String, required: true },
		login: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		class: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Class",
		},
	},
	{
		timestamps: true,
	}
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
