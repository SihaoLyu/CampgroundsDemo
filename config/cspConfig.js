const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUD_NAME}/`,
    "https://images.unsplash.com/",
    "https://fastly.picsum.photos/",
    "https://picsum.photos/"
];
const fontSrcUrls = [
    "https://cdn.jsdelivr.net",
];

module.exports.cspDirectives = {
    defaultSrc: [],
    connectSrc: ["'self'", ...connectSrcUrls],
    scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
    styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
    workerSrc: ["'self'", "blob:"],
    objectSrc: [],
    imgSrc: [
        "'self'",
        "blob:",
        "data:",
        ...imgSrcUrls
    ],
    fontSrc: ["'self'", ...fontSrcUrls],
}