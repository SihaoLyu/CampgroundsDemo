const express = require("express");
const Campground = require("../models/campground");
const Review = require("../models/review");
const AppError = require("../utils/appError");
const reviewJoiSchema = require("../utils/joiSchemas/reviewJoiSchema");

const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body, { presence: "required" });
    if (error) {
        const errorMessage = error.details.map((el) => el.message).join(", ");
        throw new AppError(errorMessage, 400, "Review Pre Validation Error");
    }
    next();
}

router.post("/reviews", validateReview, async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground) {
        throw new AppError("Invalid campground ID", 404);
    }
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`)
});

router.delete("/reviews/:reviewId", async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
});

module.exports = router;