const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

async function seedDB() {
	try {
		await mongoose.connect("mongodb://localhost:27017/campgroundDemo", {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("MONGO CONNECT DONE\n");
	} catch (err) {
		console.log("MONGO CONNECT ERROR\n");
		console.log(err);
	}
	

	await Campground.deleteMany({});
	console.log("ALL DATA REMOVED\n");

	const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

	const campgrounds = [];

	/**
	 * Add all seeds
	 */
	// cities.forEach(city => {
	// 	const campground = new Campground({
	// 		title: `${getRandom(descriptors)} ${getRandom(places)}`,
	// 		location: `${city.city} [${city.longitude}, ${city.latitude}]`
	// 	});
	// 	campgrounds.push(campground);
	// });

	/**
	 * Add random 10 seeds
	 */
	const randomCities = new Set();

	while (randomCities.size < 10) {
		const city = getRandom(cities);
		randomCities.add(city);
	};

	randomCities.forEach(city => {
		const campground = new Campground({
			title: `${getRandom(descriptors)} ${getRandom(places)}`,
			location: `${city.city} [${city.longitude}, ${city.latitude}]`
		});
		campgrounds.push(campground);
	});

	await Campground.insertMany(campgrounds);

	await mongoose.disconnect();
	console.log("MONGO DISCONNECTED\n")
};

seedDB();
