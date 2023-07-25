const User = require("../models/User.js");
const { faker } = require("@faker-js/faker");

const registerUser = async (req, res) => {
	const { name, surname } = req.body;

	const login = faker.internet.email({
		firstName: req.body.name,
		lastName: req.body.surname,
		provider: "test.ru",
	});
	const password = faker.internet.password({ length: 8 });

	const newUser = new User({ name, surname, login, password });

	newUser
		.save()
		.then(() => {
			const result = {
				fullName: newUser._doc.name + " " + newUser._doc.surname,
				login: newUser._doc.login,
				password: newUser._doc.password,
			};
			res.status(200).json(result);
		})
		.catch((error) => {
			console.error("Не удалось зарегистрировать пользователя", error);
			res.status(500).json({
				error: "Не удалось зарегистрировать пользователя",
			});
		});
};

const loginUser = async (req, res) => {
	const { login, password } = req.body;

	User.findOne({ login, password })
		.then((user) => {
			if (user) {
				res.status(200).json({ message: "Вы вошли" });
			} else {
				res.status(401).json({ error: "Неверный логин или пароль" });
			}
		})
		.catch((error) => {
			console.error("Пользователь не найден", error);
			res.status(500).json({ error: "Пользователь не найден" });
		});
};

const getUser = async (req, res) => {
	const userId = req.params.id;

	User.findById(userId)
		.then((foundUser) => {
			if (foundUser) {
				const result = {
					name: foundUser._doc.name,
					surname: foundUser._doc.surname,
					login: foundUser._doc.login,
					password: foundUser._doc.password,
				};
				return res.status(200).json(result);
			} else {
				return res.status(404).json({
					message: "Пользователь не найден",
				});
			}
		})
		.catch((error) => {
			console.error("Не удалось получить пользователя", error);
			res.status(500).json({ error: "Не удалось получить пользователя" });
		});
};

const getUsersByClassId = async (req, res) => {
	const classId = req.params.classId;

	try {
		const users = await User.find({ class: classId });
		res.status(200).json(users);
	} catch (error) {
		console.error("Error retrieving users:", error);
		res.status(500).json({ error: "Failed to retrieve users" });
	}
};

module.exports = {
	registerUser,
	loginUser,
	getUser,
	getUsersByClassId,
};
