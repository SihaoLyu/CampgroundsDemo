const express = require("express");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Review = require("./models/review");
const path = require("path");
const methodOverride = require("method-override");
const AppError = require("./utils/appError");
const { campgroundJoiSchema } = require("./utils/joiSchemas/campgroundJoiSchema");
const { reviewJoiSchema } = require("./utils/joiSchemas/reviewJoiSchema");

const app = express();

async function main() {
	/**
	 * Middleware & env variables setup
	 */

	app.engine("ejs", ejsMate);
	app.set("views", path.join(__dirname, "views"));
	app.set("view engine", "ejs");
	app.use(express.urlencoded({ extended: true }));
	app.use(methodOverride("_method"));
	app.use(express.static("public"));

	const validateCampground = (req, res, next) => {
		const { error } = campgroundJoiSchema.validate(req.body, { presence: "required" });
		if (error) {
			const errorMessage = error.details.map((el) => el.message).join(", ");
			throw new AppError(errorMessage, 400, "Campground Pre Validation Error");
		}
		next();
	};

	const validateReview = (req, res, next) => {
		const { error } = reviewJoiSchema.validate(req.body, { presence: "required" });
		if (error) {
			const errorMessage = error.details.map((el) => el.message).join(", ");
			throw new AppError(errorMessage, 400, "Review Pre Validation Error");
		}
		next();
	}

	/**
	 * Mongoose connection setup
	 */

	try {
		await mongoose.connect("mongodb://localhost:27017/campgroundDemo");
		console.log("MONGO CONNECTION DONE");
	} catch (err) {
		console.error(`MONGO CONNECTION WRONG: ${err}`);
	}

	/**
	 * APIs
	 */

	app.get("/", (req, res) => {
		// res.render("home");
		res.redirect("/campgrounds");
	});

	app.get("/campgrounds", async (req, res) => {
		const campgrounds = await Campground.find({});
		res.render("campgrounds/index", { campgrounds });
	});

	app.get("/campgrounds/new", (req, res) => {
		res.render("campgrounds/new");
	});

	app.post("/campgrounds", validateCampground, async (req, res) => {
		const newCamp = new Campground(req.body.campground);
		await newCamp.save();
		res.redirect(`/campgrounds/${newCamp._id}`);
	});

	app.get("/campgrounds/:id", async (req, res) => {
		const campground = await Campground.findById(req.params.id).populate("reviews");
		if (!campground) {
			throw new AppError("Invalid campground ID", 400);
		}
		res.render("campgrounds/show", { campground });
	});

	app.get("/campgrounds/:id/edit", async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		if (!campground) {
			throw new AppError("Invalid campground ID", 404);
		}
		res.render("campgrounds/edit", { campground });
	});

	app.put("/campgrounds/:id", validateCampground, async (req, res) => {
		const id = req.params.id;
		const newCamp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, {
			new: true,
			runValidators: true
		});
		res.redirect(`/campgrounds/${id}`);
	});

	app.delete("/campgrounds/:id", async (req, res) => {
		const id = req.params.id;
		await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
	});

	app.post("/campgrounds/:id/reviews", validateReview, async (req, res) => {
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

	app.delete("/campgrounds/:id/reviews/:reviewId", async (req, res) => {
		const { id, reviewId } = req.params;
		await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
		await Review.findByIdAndDelete(reviewId);
		res.redirect(`/campgrounds/${id}`);
	});

	/**
	 * App error handling
	 */

	app.all(/(.*)/, (req, res) => {
		throw new AppError(`${req.path} is not a valid URL`, 404);
	});

	app.use((err, req, res, next) => {
		if (!err.message) {
			err.message = "Something went wrong!";
		}
		console.error(err.stack);
		res.status(err.statusCode || 500).render("error", { err });
	});

	/**
	 * App listen port setup
	 */

	app.listen(3000, () => {
		console.log("APP STARED!");
	});

	/**
	 * Termination setup
	 */

	process.on("SIGINT", async () => {
		await mongoose.disconnect();
		console.log("MONGO DISCONNECTED");
		process.exit(0);
	});
}

main();
