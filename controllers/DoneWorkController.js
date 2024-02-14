const DoneWork = require("../models/DoneWork.js");
const Lesson = require("../models/Lesson.js");
const User = require("../models/User.js");

const addDoneWork = async (req, res) => {
	// достаем необходимые данные из тела запроса
	const {
		student,
		lessonId,
		answers,
		isVerified,
		rating,
		comment,
		allCriteriaRating,
	} = req.body;

	// определяем новый объект DoneWork
	const doneWork = new DoneWork({
		student,
		lessonId,
		answers,
		isVerified,
		rating,
		comment,
		allCriteriaRating,
	});

	try {
		// Сохраняем готовую работу
		const savedDoneWork = await doneWork.save();

		// Увеличиваем счетчик doneCount у соответствующего урока
		await Lesson.updateOne({ _id: lessonId }, { $inc: { doneCount: 1 } });

		// возвращаем объект с полем id сохраненной работы
		res.status(201).json({ id: savedDoneWork._id });
	} catch (error) {
		res.status(500).json({ error: "Сохранить работу не удалось" });
	}
};

// ! вернет готовые работы доступные для учителя
const getDoneWorks = async (req, res) => {
	try {
		const authorId = req.params.authorId; // Получаем id автора из параметров запроса

		// Находим пользователя по айди автора
		const authorUser = await User.findById(authorId);

		if (!authorUser) {
			return res.status(404).json({ error: "Автор уроков не найден" });
		}

		// Находим все готовые работы, у которых lessonId присутствует в authorLessons у пользователя
		const doneWorks = await DoneWork.find({
			lessonId: { $in: authorUser.authorLessons },
		})
			.populate("lessonId")
			.populate({
				path: "student",
				populate: {
					path: "class",
					model: "Class",
				},
			});
		const doneWorksNotVerified = doneWorks.filter(
			(work) => !work.isVerified
		);
		const doneWorksVerified = doneWorks.filter((work) => work.isVerified);

		res.json([...doneWorksNotVerified, ...doneWorksVerified]);
	} catch (error) {
		console.error("Error retrieving done works:", error);
		res.status(500).json({
			error: "Не удалось получить готовые работы доступные автору",
		});
	}
};

// ! вернет готовые работы студента
const getStudentsDoneWorks = async (req, res) => {
	try {
		const studentId = req.params.studentId; // Получаем id автора из параметров запроса

		// Находим все готовые работы, у которых lessonId присутствует в authorLessons у пользователя
		let doneWorks = await DoneWork.find({ student: studentId })
			.populate("lessonId")
			.populate({
				path: "student",
				populate: {
					path: "class",
					model: "Class",
				},
			});

		res.json(doneWorks);
	} catch (error) {
		console.error("Error retrieving done works:", error);
		res.status(500).json({
			error: "Не удалось получить готовые работы ученика",
		});
	}
};

const getOneDoneWork = async (req, res) => {
	const doneWorkId = req.params.id;

	DoneWork.findById(doneWorkId)
		.populate({
			path: "student",
			populate: {
				path: "class",
				model: "Class",
			},
		})
		.then((doneWork) => {
			if (!doneWork) {
				return res
					.status(404)
					.json({ error: "Выполненная работа не найдена" });
			}

			res.json(doneWork);
		})
		.catch((error) => {
			res.status(500).json({
				error: "Не удалось получить выполненную работу",
			});
		});
};

const updateDoneWork = async (req, res) => {
	// получаем id из параметра
	const { id } = req.params;
	// получаем данные для обновления из тела запроса
	const { isVerified, rating, comment, successCriterias } = req.body;

	try {
		// находим работу
		const doneWork = await DoneWork.findById(id);

		if (!doneWork) {
			return res
				.status(404)
				.json({ error: "Выполненная работа не найдена" });
		}

		doneWork.isVerified = isVerified;
		doneWork.rating = rating;
		doneWork.comment = comment;
		doneWork.successCriterias = successCriterias;

		await doneWork.save();

		res.status(200).json(doneWork);
	} catch (error) {
		res.status(500).json({ error: "Не удалось отредактировать работу" });
	}
};

// ! описать
const getDoneWorksByStudentId = async (req, res) => {
	const studentId = req.params.studentId;
	const activeUserId = req.params.activeUserId;

	try {
		const authorUser = await User.findById(activeUserId);

		if (!authorUser) {
			return res.status(404).json({ error: "Пользователь не найден" });
		}

		const doneWorks = await DoneWork.find({
			student: studentId,
			lessonId: { $in: authorUser.authorLessons },
		})
			.populate("lessonId")
			.populate({
				path: "student",
				populate: {
					path: "class",
					model: "Class",
				},
			});

		res.status(200).json(doneWorks);
	} catch (error) {
		res.status(500).json({
			error: "Не удалось получить все готовые работы студента доступные автору",
		});
	}
};

module.exports = {
	addDoneWork,
	getDoneWorks,
	getOneDoneWork,
	updateDoneWork,
	getDoneWorksByStudentId,
	getStudentsDoneWorks,
};
