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
	ImageController,
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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(__dirname));

app.use(cors());

app.get("/", (req, res) => res.status(200).json("hello"));

app.post("/upload", upload.single("image"), (req, res) => {
    res.json({
		url: `http://localhost:8080/uploads/${req.file.originalname}`,
	});
	// let filedata = req.file;
	// if (!filedata) res.status(400).send("Ошибка при загрузке файла");
	// else {
	// 	res.json({
	// 		url: `http://localhost:8080/uploads/${req.file.originalname}`,
	// 	});
	// }
});

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

app.post("/lesson", LessonController.addLesson);
app.get("/lesson", LessonController.getLessons);
app.get("/lesson/:id", LessonController.getOneLesson);
app.delete("/lesson/:id", LessonController.deleteLesson);
app.get(
	"/oneSudentsLessons/:id",
	LessonController.getAvailableLessonsForStudent
);

app.post("/doneWork", DoneWorkController.addDoneWork);
app.get("/doneWork", DoneWorkController.getDoneWorks);
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