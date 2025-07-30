const express = require("express");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const path = require("path");
const methodOverride = require("method-override");

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

	app.post("/campgrounds", async (req, res) => {
		const newCamp = new Campground(req.body);
		await newCamp.save();
		res.redirect(`/campgrounds/${newCamp._id}`);
	});

	app.get("/campgrounds/:id", async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render("campgrounds/show", { campground });
	});

	app.get("/campgrounds/:id/edit", async (req, res) => {
		const campground = await Campground.findById(req.params.id);
		res.render("campgrounds/edit", { campground });
	});

	app.put("/campgrounds/:id", async (req, res) => {
		const id = req.params.id;
		const newCamp = await Campground.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		res.redirect(`/campgrounds/${id}`);
	});

	app.delete("/campgrounds/:id", async (req, res) => {
		const id = req.params.id;
		await Campground.findByIdAndDelete(id);
		res.redirect("/campgrounds");
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
