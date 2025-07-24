const mongoose = require("mongoose");

const campgroundSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	price: {
		type: String,
		// required: true,
	},
	description: {
		type: String,
		// required: true,
	},
	location: {
		type: String,
		// required: true,
	},
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
