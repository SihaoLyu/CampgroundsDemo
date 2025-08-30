const express = require("express");
const Campground = require("../models/campground");
const Review = require("../models/review");
const AppError = require("../utils/appError");
const reviewJoiSchema = require("../utils/joiSchemas/reviewJoiSchema");
const { isLoggedIn } = require("../utils/commonMiddlewares");

const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body, { presence: "required" });
    if (error) {
        const errorMessage = error.details.map((el) => el.message).join(", ");
        throw new AppError(errorMessage, 400, "Review Pre Validation Error");
    }
    next();
}

router.post("/reviews", validateReview, isLoggedIn, async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    if (!campground) {
        throw new AppError("Invalid campground ID", 404);
    }
    const newReview = new Review(req.body.review);
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
    req.flash("success", "Successfully add the review!");
    res.redirect(`/campgrounds/${id}`)
});

router.delete("/reviews/:reviewId", isLoggedIn, async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully remove the review!");
    res.redirect(`/campgrounds/${id}`);
});

module.exports = router;