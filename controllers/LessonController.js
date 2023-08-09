const Lesson = require("../models/Lesson.js");
const Question = require("../models/Question.js");
const User = require("../models/User.js");
const Class = require("../models/Class.js");
const cloudinary = require("../utils/cloudinary.js");

const uploadImage = async (req, res) => {
	console.log(req.body);
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

const addLesson = async (req, res) => {
	try {
		const {
			name,
			description,
			doneCount,
			allCriteriaRating,
			questions,
			classes,
            criteria
		} = req.body;

		const savedQuestions = [];

		for (const question of questions) {
			const {
				questionText,
				description,
				criteriaRating,
				images,
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

		const savedClasses = [];

		for (const oneClass of classes) {
			const existingClass = await Class.findById(oneClass._id);

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
            criteria
		});

		await lesson.save();

		// Обновляем поле lessons у классов
		for (const oneClass of classes) {
			const existingClass = await Class.findById(oneClass._id);
			console.log("addLesson");
			console.log(existingClass);
			console.log(lesson);
			if (existingClass) {
				existingClass.lessons.push(lesson._id);
				await existingClass.save();
			}
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

		const lessons = user.class.lessons
			

		console.log("lessons", lessons);

		res.status(200).json(lessons);
	} catch (error) {
		console.error("Error getting available lessons for student:", error);
		res.status(500).json({ error: "Failed to retrieve lesson" });
	}
};

const updateLesson = async (req, res) => {
    const lessonId = req.params.id;
  const { name, description, doneCount, allCriteriaRating, questions, classes } = req.body;

  try {
    // Проверка, существует ли урок с данным идентификатором
    const existingLesson = await Lesson.findById(lessonId);

    if (!existingLesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Обновление данных урока
    existingLesson.name = name;
    existingLesson.description = description;
    existingLesson.doneCount = doneCount;
    existingLesson.allCriteriaRating = allCriteriaRating;
    existingLesson.questions = questions; // Массив вопросов передается целиком для обновления
    existingLesson.classes = classes; // Массив классов передается целиком для обновления

    // Сохранение обновленного урока в базе данных
    await existingLesson.save();

    res.status(200).json(existingLesson._id);
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({ error: "Failed to update lesson" });
  }
}

module.exports = {
	addLesson,
	getLessons,
	getOneLesson,
	deleteLesson,
	getAvailableLessonsForStudent,
	uploadImage,
    updateLesson
};
