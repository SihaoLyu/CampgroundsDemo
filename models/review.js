const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    content: String,
    rating: Number
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;