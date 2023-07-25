const Image = require("../models/Image.js");

const addImage = (req, res) => {
	// Check if the request contains a file with the key 'image'
	if (!req.files || !req.files.image) {
		return res
			.status(400)
			.json({ error: "No image file found in the request." });
	}

	const image = req.files.image;
	const imageName = image.name;

	const newImage = new Image({
		filename: imageName,
		contentType: image.mimetype,
	});

	newImage
		.save()
		.then(() => {
			res.status(200).json({ message: "Image added successfully." });
		})
		.catch((err) => {
			res.status(500).json({
				error: "Failed to add the image to the database.",
			});
		});
};

const addImage1 = async (req, res) => {
	const body = req.body;
	try {
		const newImage = await Image.create(body);
		newImage.save();
		res.status(201).json({ message: "new image upload" });
	} catch (error) {
		res.status(409).json({ message: error.message });
	}
};

module.exports = {
	addImage,
	addImage1,
};
