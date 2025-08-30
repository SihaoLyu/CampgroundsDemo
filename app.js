const express = require("express");
const app = express();

async function main() {
	/**
	 * Middleware & env variables config
	 */

	const ejsMate = require("ejs-mate");
	const path = require("path");
	const methodOverride = require("method-override");

	app.engine("ejs", ejsMate);
	app.set("views", path.join(__dirname, "views"));
	app.set("view engine", "ejs");
	app.use(express.urlencoded({ extended: true }));
	app.use(methodOverride("_method"));
	app.use(express.static("public"));

	/**
	 * Session & Flash config
	 */

	const session = require("express-session");

	const sessionOptions = {
		secret: "TBD",
		resave: false, 
		saveUninitialized: true, 
		cookie: {
			expires: Date.now() + 7 * 1000 * 60 * 60 * 24,
			maxAge: 7 * 1000 * 60 * 60 * 24,
			httpOnly: true
		}
	};
	app.use(session(sessionOptions));

	/**
	 * Auth config
	 */

	const passport = require("passport");
	app.use(passport.initialize());
	app.use(passport.session());

	const User = require("./models/user");
	passport.use(User.createStrategy());
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());

	/**
	 * Flash config
	 */

	const flash = require("connect-flash");

	app.use(flash());
	app.use((req, res, next) => {
		res.locals.success = req.flash("success");
		res.locals.error = req.flash("error");
		res.locals.currentUser = req.user;
		next();
	});

	/**
	 * Mongoose connection config
	 */

	const mongoose = require("mongoose");

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
	 * Routers config
	 */

	const reviewRouter = require("./routes/reviewRouter");
	const campgroundRouter = require("./routes/campgroundRouter");
	const authRouter = require("./routes/authRouter");

	app.use("/campgrounds/:id", reviewRouter);
	app.use("/campgrounds", campgroundRouter);
	app.use("/", authRouter);

	/**
	 * App error handling
	 */

	const AppError = require("./utils/appError");

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
