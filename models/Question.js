const mongoose = require("mongoose");

const questionSchema = mongoose.Schema(
	{
		images: {
			type: [],
		},
		questionText: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		criteriaRating: {
			type: Number,
		},
		criteria: [{ text: String, value: Number, status: Boolean }],
	},
	{
		timestamps: true,
	}
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
