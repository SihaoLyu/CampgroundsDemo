async function main() {
	/**
	 * App basic setup
	 */
	
	const express = require("express");
	const ejsMate = require("ejs-mate");
	const path = require("path");
	const methodOverride = require("method-override");

	if (process.env.NODE_ENV !== "production") {
		require("dotenv").config();
	}

	const app = express();
	app.set("query parser", "extended");
	app.engine("ejs", ejsMate);
	app.set("views", path.join(__dirname, "views"));
	app.set("view engine", "ejs");
	app.use(express.urlencoded({ extended: true }));
	app.use(methodOverride("_method"));
	app.use(express.static("public"));

	/**
	 * Security config
	 */

	const sanitizeV5 = require("./utils/mongoSanitizeV5");
	const helmet = require("helmet");
	const { cspDirectives } = require("./config/cspConfig");

	app.use(sanitizeV5({ replaceWith: '_' }));
	app.use(
		helmet.contentSecurityPolicy({
			directives: cspDirectives
		})
	);

	/**
	 * Session & Flash config
	 */

	const session = require("express-session");
	const MongoStore = require("connect-mongo");

	if (!process.env.MONGODB_URI) {
		throw new AppError(
			"MONGODB_URI environment variable is not defined. Please set it in your environment.",
			503
		);
	}

	const sessionOptions = {
		name: "session",
		secret: process.env.COOKIE_SESSION_SECRET,
		resave: false, 
		saveUninitialized: true, 
		cookie: {
			expires: Date.now() + 7 * 1000 * 60 * 60 * 24,
			maxAge: 7 * 1000 * 60 * 60 * 24,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production"
		},
		store: MongoStore.create({
			mongoUrl: process.env.MONGODB_URI,
			touchAfter: 24 * 60 * 60,
			crypto: {
				secret: process.env.MONGO_STORE_SECRET,
			}
		})
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

	app.use((req, res, next) => {
		if (!["/login", "/register", "/logout"].includes(req.path)) {
			req.session.returnTo = req.originalUrl;
		}
		next();
	});

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

	if (!process.env.MONGODB_URI) {
		throw new Error("MONGODB_URI environment variable is not set.");
	}

	try {
		await mongoose.connect(process.env.MONGODB_URI);
		console.log("MONGO CONNECTION DONE");
	} catch (err) {
		throw new AppError(`MONGO CONNECTION WRONG: ${err}`, 503);
	}

	/**
	 * Entrypoint API
	 */

	app.get("/", (req, res) => {
		// res.render("home");
		res.render("home");
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
	const CHROME_DEVTOOLS_URL = "/.well-known/appspecific/com.chrome.devtools.json"

	app.all(/(.*)/, (req, res) => {
		if (req.path !== CHROME_DEVTOOLS_URL) {
			throw new AppError(`${req.path} is not a valid URL`, 404);
		}
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
