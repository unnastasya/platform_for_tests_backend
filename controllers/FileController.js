const uploadFile = (req, res) => {
	try {
        const file = req.files.file;

        let path = `${config}`
	} catch (error) {
		console.log(error);
		return res.status(500).json({ message: "Upload error" });
	}
};

module.exports = {
	uploadFile,
};
