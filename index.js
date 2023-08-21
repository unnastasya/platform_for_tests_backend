const express = require("express");
const mongoose = require("mongoose");
const port = process.env.PORT || "8080";
const cors = require("cors");
const multer = require("multer");

require("dotenv").config();
const {
	UserController,
	ClassController,
	LessonController,
	DoneWorkController,
} = require("./controllers/index.js");

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {
		console.log("Connect DB");
	})
	.catch(() => {
		console.log("Error DB");
	});

const storage = multer.diskStorage({
	destination: (_, __, cb) => {
		cb(null, "uploads");
	},
	filename: (_, file, cb) => {
		cb(null, file.originalname);
	},
});
const upload = multer({ storage });

const app = express();

app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(express.static(__dirname));

app.get("/", (req, res) => res.status(200).json("hello"));

app.post("/uploadImage", LessonController.uploadImage);

// app.post("/addImage", ImageController.addImage1);

app.post("/auth/register", UserController.registerUser);
app.post("/auth/login", UserController.loginUser);
app.get("/user/:id", UserController.getUser);
app.get("/userByClassId/:classId", UserController.getUsersByClassId);

app.post("/class", ClassController.addClass);
app.get("/class", ClassController.getClass);
app.get("/class/:id", ClassController.getOneClass);
app.delete("/class/:id", ClassController.deleteClass);
app.post("/classes/:classId/addLesson", ClassController.addLessonToClass);
app.put("/class/:id", ClassController.updateClass);

app.post("/lesson", LessonController.addLesson);
app.get("/lesson/:authorId", LessonController.getLessons);
app.get("/lesson/:id", LessonController.getOneLesson);
app.delete("/lesson/:id", LessonController.deleteLesson);
app.get(
	"/oneSudentsLessons/:id",
	LessonController.getAvailableLessonsForStudent
);
app.put("/lesson/:id", LessonController.updateLesson);

app.post("/doneWork", DoneWorkController.addDoneWork);
app.get("/doneWork/:authorId", DoneWorkController.getDoneWorks);
app.get("/doneWork/:id", DoneWorkController.getOneDoneWork);
app.get(
	"/doneWorkByStudentId/:studentId",
	DoneWorkController.getDoneWorksByStudentId
);
app.put("/doneWork/:id", DoneWorkController.updateDoneWork);

app.listen(port, (err) => {
	if (err) {
		console.log(err);
	}

	console.log("Server OK");
});
