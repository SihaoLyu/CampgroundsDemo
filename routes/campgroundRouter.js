const express = require("express");
const Campground = require("../models/campground");
const campgroundJoiSchema = require("../utils/joiSchemas/campgroundJoiSchema");
const AppError = require("../utils/appError");
const { isLoggedIn } = require("../utils/commonMiddlewares");

const router = express.Router();

const validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body, { presence: "required" });
    if (error) {
        const errorMessage = error.details.map((el) => el.message).join(", ");
        throw new AppError(errorMessage, 400, "Campground Pre Validation Error");
    }
    next();
};

const isCampgroundAuthor = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!req.user.equals(campground.author)) {
        req.flash("error", "You do not have the permission");
        return res.redirect("/campgrounds");
    }
    next();
}

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post("/", validateCampground, isLoggedIn, async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash("success", "Successfully adding campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
});

router.get("/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews").populate("author");
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
});

router.get("/:id/edit", isLoggedIn, isCampgroundAuthor, async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
});

router.put("/:id", validateCampground, isLoggedIn, isCampgroundAuthor, async (req, res) => {
    const id = req.params.id;
    const newCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {
        new: true,
        runValidators: true
    });
    req.flash("success", "successfully update the campground!");
    res.redirect(`/campgrounds/${id}`);
});

router.delete("/:id", isLoggedIn, isCampgroundAuthor, async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully delete the campground");
    res.redirect("/campgrounds");
});

module.exports = router;