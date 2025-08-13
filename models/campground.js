const mongoose = require("mongoose");
const Review = require("./review");

const campgroundSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
		get: v => typeof v === 'string' ? parseFloat(v) : v,
		set: v => typeof v === 'string' ? parseFloat(v) : v
	},
	description: {
		type: String,
	},
	location: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	reviews: [
		{
			type: mongoose.Schema.ObjectId,
			ref: "Review"
		}
	]
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
	if (doc) {
		await Review.deleteMany({
			_id: { $in: doc.reviews }
		})
	}
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
