const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		doneCount: {
			type: Number,
			required: true,
		},
		allCriteriaRating: {
			type: Number,
		},
		questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
		// criteria: [{ text: String, value: Number, status: Boolean }],
		classes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Class",
			},
		],
	},
	{
		timestamps: true,
	}
);

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
