const mongoose = require("mongoose");

const ClassSchema = mongoose.Schema(
	{
		school: {
			type: String,
			required: true,
		},
		class: {
			type: String,
			required: true,
		},
		studentsCount: {
			type: Number,
		},
        students: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		lessons: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Lesson",
			},
		],
	},
	{
		timestamps: true,
	}
);

const Class = mongoose.model("Class", ClassSchema);

module.exports = Class;
