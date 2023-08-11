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
				_id: newUser._id,
				fullName: newUser._doc.name + " " + newUser._doc.surname,
				login: newUser._doc.login,
				password: newUser._doc.password,
				role: "student",
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

	User.findOne({ login, password }).populate("class")
		.then((user) => {
			if (user) {
				res.status(200).json({
					message: "Вы вошли",
					user: {
						userId: user._id,
						fullName: user.name + " " + user.surname,
						role: user.role || "student",
                        school: user.class.school || "",
                        class: user.class.class || ""
					},
				});
			} else {
				return res
					.status(401)
					.json({ errorMessage: "Неверный логин или пароль" });
			}
		})
		.catch((error) => {
			console.error("Не удалось авторизоваться", error);
			res.status(500).json({ errorMessage: "Не удалось авторизоваться" });
		});
};

const getUser = async (req, res) => {
	const userId = req.params.id;

	User.findById(userId)
		.then((foundUser) => {
			if (foundUser) {
				const result = {
					userId: foundUser._id,
					fullName: foundUser.name + " " + foundUser.surname,
					role: foundUser.role || "student",
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
