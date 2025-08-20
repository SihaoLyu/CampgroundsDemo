const express = require("express");
const Campground = require("../models/campground");
const campgroundJoiSchema = require("../utils/joiSchemas/campgroundJoiSchema");
const AppError = require("../utils/appError");

const router = express.Router();

const validateCampground = (req, res, next) => {
    const { error } = campgroundJoiSchema.validate(req.body, { presence: "required" });
    if (error) {
        const errorMessage = error.details.map((el) => el.message).join(", ");
        throw new AppError(errorMessage, 400, "Campground Pre Validation Error");
    }
    next();
};

router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

router.get("/new", (req, res) => {
    res.render("campgrounds/new");
});

router.post("/", validateCampground, async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    await newCamp.save();
    res.redirect(`/campgrounds/${newCamp._id}`);
});

router.get("/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews");
    if (!campground) {
        throw new AppError("Invalid campground ID", 400);
    }
    res.render("campgrounds/show", { campground });
});

router.get("/:id/edit", async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        throw new AppError("Invalid campground ID", 404);
    }
    res.render("campgrounds/edit", { campground });
});

router.put("/:id", validateCampground, async (req, res) => {
    const id = req.params.id;
    const newCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {
        new: true,
        runValidators: true
    });
    res.redirect(`/campgrounds/${id}`);
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
});

module.exports = router;