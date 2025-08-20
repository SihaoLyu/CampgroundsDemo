const express = require("express");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const AppError = require("./utils/appError");
const reviewRouter = require("./routes/reviewRouter");
const campgroundRouter = require("./routes/campgroundRouter");

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

	/**
	 * Routers setup
	 */

	app.use("/campgrounds/:id", reviewRouter);
	app.use("/campgrounds", campgroundRouter);

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
	 * Entrypoint API
	 */

	app.get("/", (req, res) => {
		// res.render("home");
		res.redirect("/campgrounds");
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
