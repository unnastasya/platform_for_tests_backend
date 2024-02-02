const Lesson = require("../models/Lesson.js");
const Question = require("../models/Question.js");
const User = require("../models/User.js");
const Class = require("../models/Class.js");
const cloudinary = require("../utils/cloudinary.js");

const uploadImage = async (req, res) => {
	try {
		const { file } = req.body;
		const fileResult = await cloudinary.uploader.upload(file, {
			folder: "questions",
		});
		const result = { public_id: fileResult.public_id, url: fileResult.url };
		res.status(201).json(result);
	} catch (error) {
		console.error("Error loading image:", error);
		res.status(500).json({
			errorMessga: "Failed to load image",
			error: error,
		});
	}
};

const addQuestion = async (question, savedQuestions) => {
	try {
		const { questionText, criteriaRating, images, criteria } = question;

		const newQuestion = new Question({
			questionText,
			criteriaRating,
			criteria,
			images,
		});

		savedQuestions.push(newQuestion);
		await newQuestion.save();
	} catch (error) {}
};

const addLesson = async (req, res) => {
	try {
		const {
			name,
			doneCount,
			allCriteriaRating,
			questions,
			classes,
			authorId,
		} = req.body;

		const savedQuestions = [];

		for (const question of questions) {
			addQuestion(question, savedQuestions);
		}

		const savedClasses = [];

		for (const oneClass of classes) {
			console.log("oneClass", oneClass);

			const existingClass = await Class.findById(oneClass._id);
			console.log("existingClass", existingClass);

			if (existingClass) {
				savedClasses.push(existingClass);
			}
		}

		const lesson = new Lesson({
			name,
			doneCount,
			allCriteriaRating,
			classes,
			questions: savedQuestions,
			authorId,
		});

		await lesson.save();

		// Обновляем поле lessons у классов
		for (const oneClass of classes) {
			const existingClass = await Class.findById(oneClass);

			if (existingClass) {
				existingClass.lessons.push(lesson._id);
				await existingClass.save();
			}

			const existingClass2 = await Class.findById(oneClass);
		}

		// Добавляем айди урока пользователю в поле authorLessons
		const authorUser = await User.findById(authorId);

		if (authorUser) {
			authorUser.authorLessons.push(lesson._id);
			await authorUser.save();
		}

		res.status(201).json(lesson._id);
	} catch (error) {
		console.error("Error saving lesson:", error);
		res.status(500).json({
			errorMessga: "Failed to save lesson",
			error: error,
		});
	}
};

const getLessons = async (req, res) => {
	try {
		const authorId = req.params.authorId; // Получаем id автора из параметров запроса

		const lessons = await Lesson.find({ authorId, isDeleted: false })
			.populate("questions")
			.populate("classes");

		res.status(200).json(lessons);
	} catch (error) {
		console.error("Error retrieving lessons:", error);
		res.status(500).json({ error: "Failed to retrieve lessons" });
	}
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
		const lesson = await Lesson.findById(lessonId);

		lesson.isDeleted = true;

		await lesson.save();

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

		const lessons = user.class.lessons.filter(
			(el) => el.isDeleted == false && el.isVisible == true
		);

		res.status(200).json(lessons);
	} catch (error) {
		console.error("Error getting available lessons for student:", error);
		res.status(500).json({ error: "Failed to retrieve lesson" });
	}
};

const updateLesson = async (req, res) => {
	const lessonId = req.params.id;
	const {
		name,
		description,
		doneCount,
		allCriteriaRating,
		questions,
		classes,
	} = req.body;

	try {
		// Проверка, существует ли урок с данным идентификатором
		const existingLesson = await Lesson.findById(lessonId);

		if (!existingLesson) {
			return res.status(404).json({ error: "Lesson not found" });
		}
		const savedQuestions = [];

		for (const question of questions) {
			if ("_id" in question) {
				const existingQuestion = await Question.findById(question._id);
				const {
					questionText,
					description,
					criteriaRating,
					images,
					criteria,
				} = question;

				existingQuestion.questionText = questionText;
				existingQuestion.description = description;
				existingQuestion.criteriaRating = criteriaRating;
				existingQuestion.images = images;
				existingQuestion.criteria = criteria;

				await existingQuestion.save();

				savedQuestions.push(question);
			} else {
				const {
					questionText,
					description,
					criteriaRating,
					images,
					criteria,
				} = question;

				const newQuestion = new Question({
					questionText,
					description,
					criteriaRating,
					criteria,
					images,
				});

				savedQuestions.push(newQuestion);
				await newQuestion.save();
			}
		}

		// Обновление данных урока
		existingLesson.name = name;
		existingLesson.description = description;
		existingLesson.doneCount = doneCount;
		existingLesson.allCriteriaRating = allCriteriaRating;
		existingLesson.questions = savedQuestions; // Массив вопросов передается целиком для обновления
		existingLesson.classes = classes; // Массив классов передается целиком для обновления

		// Сохранение обновленного урока в базе данных
		await existingLesson.save();

		res.status(200).json(existingLesson._id);
	} catch (error) {
		console.error("Error updating lesson:", error);
		res.status(500).json({ error: "Failed to update lesson" });
	}
};

const changeVisible = async (req, res) => {
	const lessonId = req.params.id;

	try {
		const existingLesson = await Lesson.findById(lessonId);
		existingLesson.isVisible = !existingLesson.isVisible;
		await existingLesson.save();
		res.status(200).json();
	} catch (error) {
		console.error("Error updating lesson:", error);
		res.status(500).json({ error: "Failed to update lesson" });
	}
};

module.exports = {
	addLesson,
	getLessons,
	getOneLesson,
	deleteLesson,
	getAvailableLessonsForStudent,
	uploadImage,
	updateLesson,
	changeVisible,
};
