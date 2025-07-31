const mongoose = require("mongoose");
const jokes = require("give-me-a-joke");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

const SEEDS_NUM = 3; 	// MAX 1000

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
	
	/**
	 * Remove all old seeds
	 */

	await Campground.deleteMany({});
	console.log("ALL DATA REMOVED\n");

	/**
	 * Add new seeds
	 */

	const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

	const getRandomJokePromise = () => {
		return new Promise((resolve, reject) => {
			jokes.getRandomDadJoke((err, joke) => {
				if (err) {
					reject(err);
				} else {
					resolve(joke);
				}
			});
		});
	};

	const campgrounds = [];
	const randomCities = new Set();

	while (randomCities.size < SEEDS_NUM) {
		const city = getRandom(cities);
		randomCities.add(city);
	};

	for (const city of randomCities) {
		const campground = new Campground({
			title: `${getRandom(descriptors)} ${getRandom(places)}`,
			location: `${city.city}`,
			image: `https://picsum.photos/seed/${Math.random()}/400`,
			price: 10 + Math.floor(Math.random() * 25),
			description: await getRandomJokePromise()
		});
		campgrounds.push(campground);
	};

	await Campground.insertMany(campgrounds);

	await mongoose.disconnect();
	console.log("MONGO DISCONNECTED\n")
};

seedDB();
