const mongoose = require("mongoose");

const campgroundSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		// required: true,
		get: v => typeof v === 'string' ? parseFloat(v) : v,
		set: v => typeof v === 'string' ? parseFloat(v) : v
	},
	description: {
		type: String,
		// required: true,
	},
	location: {
		type: String,
		// required: true,
	},
	image: {
		type: String,
		// required: true
	}
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
