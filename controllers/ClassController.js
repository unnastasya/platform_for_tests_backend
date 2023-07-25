const Class = require("../models/Class.js");
const User = require("../models/User.js");
const { faker } = require("@faker-js/faker");

const addClass = async (req, res) => {
	const { school, class: className, people } = req.body;

	try {
		const newClass = new Class({
			school,
			class: className,
			studentsCount: people.length,
		});

		await newClass.save();

		const savedUsers = [];

		for (const person of people) {
			const { name, surname } = person;
			const login = faker.internet.email({
				firstName: name,
				lastName: surname,
				provider: "test.ru",
			});
			const password = faker.internet.password({ length: 8 });

			const newUser = new User({
				name,
				surname,
				login,
				password,
				class: newClass._id,
			});

			const savedUser = await newUser.save();
			savedUsers.push({
				fullName: savedUser.name + " " + savedUser.surname,
				login: savedUser.login,
				password: savedUser.password,
			});
		}

		res.status(201).json(savedUsers);
	} catch (error) {
		console.error("Error adding class:", error);
		res.status(500).json({ error: "Failed to add class" });
	}
};

const getClass = async (req, res) => {
	Class.find()
		.then((classes) => {
			res.status(200).json(classes);
		})
		.catch((error) => {
			console.error("Error retrieving classes:", error);
			res.status(500).json({ error: "Failed to retrieve classes" });
		});
};

const getOneClass = async (req, res) => {
	const classId = req.params.id;

	Class.findById(classId)
		.then((foundClass) => {
			if (foundClass) {
				res.status(200).json(foundClass);
			} else {
				res.status(404).json({ error: "Class not found" });
			}
		})
		.catch((error) => {
			console.error("Error retrieving class:", error);
			res.status(500).json({ error: "Failed to retrieve class" });
		});
};

const deleteClass = async (req, res) => {
	const classId = req.params.id;

	Class.findByIdAndRemove(classId)
		.then((deletedClass) => {
			if (deletedClass) {
				res.status(200).json({ message: "Class deleted successfully" });
			} else {
				res.status(404).json({ error: "Class not found" });
			}
		})
		.catch((error) => {
			console.error("Error deleting class:", error);
			res.status(500).json({ error: "Failed to delete class" });
		});
};

const addLessonToClass = async (req, res) => {
	const classId = req.params.classId;
	const lessonId = req.body.lessonId;

	try {
		const classObj = await Class.findById(classId);

		if (!classObj) {
			return res.status(404).json({ error: "Class not found" });
		}

		if (!classObj.lessons) {
			classObj.lessons = [];
		}
		classObj.lessons.push(lessonId);

		await classObj.save();

		res.status(200).json({ message: "Lesson added to class successfully" });
	} catch (error) {
		console.error("Error adding lesson to class:", error);
		res.status(500).json({ error: "Failed to add lesson to class" });
	}
};

module.exports = {
	addClass,
	getClass,
	getOneClass,
	deleteClass,
	addLessonToClass,
};
