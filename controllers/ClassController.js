const { populate } = require("dotenv");
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
			students: [],
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

			newClass.students.push(savedUser._id);
			await newClass.save();
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
		.populate("students")
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

const updateClass = async (req, res) => {
	const classId = req.params.id;
	const { school, class: className, people } = req.body;

	try {
		const existingClass = await Class.findById(classId);

		if (!existingClass) {
			return res.status(404).json({ error: "Class not found" });
		}

		existingClass.school = school;
		existingClass.class = className;
		existingClass.studentsCount = people.length;

		const existingUsers = await User.find({
			login: { $in: people.map((person) => person.login) },
		});

		const savedUsers = [];

		for (const person of people) {
			const existingUser = existingUsers.find(
				(user) => user.login === person.login
			);

			if (existingUser) {
				existingUser.name = person.name;
				existingUser.surname = person.surname;
				await existingUser.save();
			} else {
				const newUser = new User({
					name: person.name,
					surname: person.surname,
					login: faker.internet.email({
						firstName: person.name,
						lastName: person.surname,
						provider: "test.ru",
					}),
					password: faker.internet.password({ length: 8 }),
					class: existingClass._id,
				});

				const savedUser = await newUser.save();
				savedUsers.push({
					fullName: savedUser.name + " " + savedUser.surname,
					login: savedUser.login,
					password: savedUser.password,
				});

				existingClass.students.push(savedUser._id);
			}
		}

		await existingClass.save();

		res.status(200).json(savedUsers);
	} catch (error) {
		console.error("Error updating class:", error);
		res.status(500).json({ error: "Failed to update class" });
	}
};

module.exports = {
	addClass,
	getClass,
	getOneClass,
	deleteClass,
	addLessonToClass,
	updateClass,
};
