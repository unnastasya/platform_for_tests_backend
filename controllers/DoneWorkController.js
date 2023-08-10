const DoneWork = require("../models/DoneWork.js");
const Lesson = require("../models/Lesson.js");

const addDoneWork = async (req, res) => {
	const {
		student,
		lessonId,
		answers,
		isVerified,
		school,
		class: className,
		rating,
		comment,
		allCriteriaRating,
	} = req.body;

	const doneWork = new DoneWork({
		student,
		lessonId,
		answers,
		isVerified,
		school,
		class: className,
		rating,
		comment,
		allCriteriaRating,
	});

	try {
		// Сохраняем готовую работу
		const savedDoneWork = await doneWork.save();

		// Увеличиваем счетчик doneCount у соответствующего урока
		await Lesson.updateOne({ _id: lessonId }, { $inc: { doneCount: 1 } });

		res.status(201).json({ id: savedDoneWork._id });
	} catch (error) {
		console.error("Error saving done work:", error);
		res.status(500).json({ error: "Failed to save done work" });
	}
};

const getDoneWorks = async (req, res) => {
	DoneWork.find({})
		.populate("lessonId")
		.populate({
			path: "student",
			populate: {
				path: "class",
				model: "Class",
			},
		})
		.then((doneWorks) => {
			res.json(doneWorks);
		})
		.catch((error) => {
			console.error("Error retrieving done works:", error);
			res.status(500).json({ error: "Failed to retrieve done works" });
		});
};

const getOneDoneWork = async (req, res) => {
	const doneWorkId = req.params.id;
	console.log(doneWorkId);
	DoneWork.findById(doneWorkId)
		.populate("student")
		.then((doneWork) => {
			console.log(doneWork);
			if (!doneWork) {
				return res.status(404).json({ error: "Done work not found" });
			}

			res.json(doneWork);
		})
		.catch((error) => {
			console.error("Error retrieving done work:", error);
			res.status(500).json({ error: "Failed to retrieve done work" });
		});
};

const updateDoneWork = async (req, res) => {
	const { id } = req.params;
	const { isVerified, rating, comment, criteriaStatuses } = req.body;

	try {
		const doneWork = await DoneWork.findById(id);

		if (!doneWork) {
			return res.status(404).json({ error: "Done work not found" });
		}

		doneWork.isVerified = isVerified;
		doneWork.rating = rating;
		doneWork.comment = comment;

		await doneWork.save();

		res.status(200).json(doneWork);
	} catch (error) {
		console.error("Error updating done work:", error);
		res.status(500).json({ error: "Failed to update done work" });
	}
};

const getDoneWorksByStudentId = async (req, res) => {
	const studentId = req.params.studentId;

	try {
		const doneWorks = await DoneWork.find({ student: studentId });
		res.status(200).json(doneWorks);
	} catch (error) {
		console.error("Error retrieving done works:", error);
		res.status(500).json({ error: "Failed to retrieve done works" });
	}
};

module.exports = {
	addDoneWork,
	getDoneWorks,
	getOneDoneWork,
	updateDoneWork,
	getDoneWorksByStudentId,
};
