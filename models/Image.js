const mongoose = require("mongoose");

// Определение схемы для модели изображения
const imageSchema = new mongoose.Schema({
	myFile: String,
});

// Создание модели Image на основе схемы imageSchema
const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
