if (process.env.NODE_ENV !== "production") {
	require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const { faker } = require("@faker-js/faker");

const SEEDS_NUM = 300; 	// MAX 1000

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

	// await Campground.deleteMany({});
	// console.log("ALL DATA REMOVED\n");

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
		const location = `${city.city}, ${city.state}`;
		const campground = new Campground({
			title: `${getRandom(descriptors)} ${getRandom(places)}`,
			price: 10 + Math.floor(Math.random() * 25),
			description: faker.lorem.paragraph({ min: 1, max: 3 }),
			location: location,
			geometry: {
				type: "Point",
				coordinates: [city.longitude, city.latitude]
			},
			images: [
				{
					url: `https://picsum.photos/seed/${Math.random()}/400`,
					fileName: `${Date.now()}`
				}
			],
			author: "68b29d3ad3f0d8b6b37ff97b"
		});
		campgrounds.push(campground);
	};

	const result = await Campground.insertMany(campgrounds);
	console.log(result);

	await mongoose.disconnect();
	console.log("MONGO DISCONNECTED\n")
};

seedDB();
