const mongoose = require("mongoose");
const Review = require("./review");
const { removeImages } = require("../services/storage");

const imageSchema = mongoose.Schema({
	url: String,
	fileName: String
});

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
	images: [imageSchema],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
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
		});
		await removeImages(doc.images.map(i => (i.fileName)));
	}
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
