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
		school: {
			type: String,
		},
		class: {
			type: String,
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
		criteriaStatuses: { type: Array },
	},
	{
		timestamps: true,
	}
);

const DoneWork = mongoose.model("DoneWork", doneWorkSchema);

module.exports = DoneWork;
