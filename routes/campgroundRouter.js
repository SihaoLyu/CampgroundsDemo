const express = require("express");
const Campground = require("../models/campground");
const campgroundJoiSchema = require("../utils/joiSchemas/campgroundJoiSchema");
const AppError = require("../utils/appError");
const { isLoggedIn } = require("../utils/commonMiddlewares");
const { uploadImageParser, urlDerive, removeImages } = require("../services/storage");
const { getGeometry } = require("../services/map");

const router = express.Router();

const PAGE_SIZE_DEFAULT = 8;

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
    if (!req.user._id.equals(campground.author)) {
        req.flash("error", "You do not have the permission");
        return res.redirect("/campgrounds");
    }
    next();
}

router.get('/', async (req, res) => {
    const page = Math.max(parseInt(req.query.page || '1'), 1);
    const limit = Math.max(parseInt(req.query.limit || PAGE_SIZE_DEFAULT), 1);
    const [total, campgrounds, allGeometries] = await Promise.all([
        Campground.estimatedDocumentCount({}),
        Campground.find({}).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit)
            .select('title location description images').slice("images", 1).lean(),
        Campground.find({}).select('geometry title _id').lean()
    ]);
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    res.render('campgrounds/index', { campgrounds, page, totalPages, limit, allGeometries });
});

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.post("/", isLoggedIn, uploadImageParser.array("images"), validateCampground, async (req, res) => {
    const newCamp = new Campground(req.body.campground);
    newCamp.geometry = await getGeometry(newCamp.location);
    newCamp.author = req.user._id;
    newCamp.images = req.files.map(f => ({ url: urlDerive(f), fileName: f.filename }));
    await newCamp.save();
    req.flash("success", "Successfully adding campground!");
    res.redirect(`/campgrounds/${newCamp._id}`);
});

router.get("/:id", async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("author").populate({ path: "reviews", populate: "author" });
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

router.put("/:id", isLoggedIn, isCampgroundAuthor, uploadImageParser.array("images"), validateCampground, async (req, res) => {
    const { id } = req.params;
    const newCamp = await Campground.findByIdAndUpdate(
        id, { ...req.body.campground },
        {
            new: true,
            runValidators: true
        }
    );
    newCamp.geometry = await getGeometry(newCamp.location);
    const imagesToAdd = req.files.map(f => ({ url: urlDerive(f), fileName: f.filename }));
    newCamp.images.push(...imagesToAdd);
    await newCamp.save();
    const imagesToRemove = req.body.imagesToRemove || [];
    if (imagesToRemove.length > 0) {
        await newCamp.updateOne({ $pull: { images: { fileName: { $in: imagesToRemove } } } });
        await removeImages(imagesToRemove);
    }
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