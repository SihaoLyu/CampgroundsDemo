const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
    content: String,
    // rating: String
})

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;