const mongoose = require("mongoose");

const doneWorkSchema = mongoose.Schema(
	{
		student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
		answers: {
			type: [String],
		},
		isVerified: {
			type: Boolean,
		},
		rating: {
			type: Number,
		},
		comment: {
			type: String,
		},
		allCriteriaRating: {
			type: Number,
		},
		successCriterias: { type: Array },
	},
	{
		timestamps: true,
	}
);

const DoneWork = mongoose.model("DoneWork", doneWorkSchema);

module.exports = DoneWork;
