const Lesson = require("../models/Lesson.js");
const Question = require("../models/Question.js");
const User = require("../models/User.js");
const Class = require("../models/Class.js");
const cloudinary = require("../utils/cloudinary.js");

const addLesson = async (req, res) => {
	try {
		const {
			name,
			description,
			doneCount,
			allCriteriaRating,
			questions,
			classes,
		} = req.body;

		const savedQuestions = [];

		for (const question of questions) {
			const {
				questionText,
				description,
				criteriaRating,
				criteria,
				images,
			} = question;

			const imagesResult = [];
			for (let image of images) {
				const result = await cloudinary.uploader.upload(image.file, {
					folder: "questions",
					// width: 300,
					// crop: "scale"
				});
				imagesResult.push({
					public_id: result.public_id,
					url: result.secure_url,
				});
			}

			const newQuestion = new Question({
				questionText,
				description,
				criteriaRating,
				criteria,
				images: imagesResult,
			});

			savedQuestions.push(newQuestion);
			await newQuestion.save();
		}

		const savedClasses = [];

		for (const classId of classes) {
			const existingClass = await Class.findById(classId);

			if (existingClass) {
				savedClasses.push(existingClass);
			}
		}

		const lesson = new Lesson({
			name,
			description,
			doneCount,
			allCriteriaRating,
			classes: savedClasses,
			questions: savedQuestions,
		});

		await lesson.save();

		// Обновляем поле lessons у классов
		for (const classId of classes) {
			const existingClass = await Class.findById(classId);

			if (existingClass) {
				existingClass.lessons.push(lesson);
				await existingClass.save();
			}
		}

		res.status(201).json(lesson._id);
	} catch (error) {
		console.error("Error saving lesson:", error);
		res.status(500).json({ errorMessga: "Failed to save lesson", error: error });
	}
};

const getLessons = async (req, res) => {
	Lesson.find()
		.populate("questions")
		.populate("classes")
		.then((lessons) => {
			res.status(200).json(lessons);
		})
		.catch((error) => {
			console.error("Error retrieving lessons:", error);
			res.status(500).json({ error: "Failed to retrieve lessons" });
		});
};

const getOneLesson = async (req, res) => {
	const lessonId = req.params.id;

	Lesson.findById(lessonId)
		.populate("questions")
		.populate("classes")
		.then((foundLesson) => {
			if (foundLesson) {
				res.status(200).json(foundLesson);
			} else {
				res.status(404).json({ error: "Lesson not found" });
			}
		})
		.catch((error) => {
			console.error("Error retrieving lesson:", error);
			res.status(500).json({ error: "Failed to retrieve lesson" });
		});
};

const deleteLesson = async (req, res) => {
	const lessonId = req.params.id;

	try {
		// Удаление связанных вопросов
		await Question.deleteMany({ lessonId });

		// Удаление урока
		await Lesson.findByIdAndDelete(lessonId);

		res.sendStatus(200);
	} catch (error) {
		console.error("Error deleting lesson:", error);
		res.status(500).json({ error: "Failed to delete lesson" });
	}
};

const getAvailableLessonsForStudent = async (req, res) => {
	const studentId = req.params.id;
	try {
		const user = await User.findById(studentId).populate({
			path: "class",
			populate: {
				path: "lessons",
				model: "Lesson",
			},
		});

		if (!user) {
			throw new Error("User not found");
		}

		const lessons = user.class.lessons;

		res.status(200).json(lessons);
	} catch (error) {
		console.error("Error getting available lessons for student:", error);
		res.status(500).json({ error: "Failed to retrieve lesson" });
	}
};

module.exports = {
	addLesson,
	getLessons,
	getOneLesson,
	deleteLesson,
	getAvailableLessonsForStudent,
};
