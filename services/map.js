const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const AppError = require("../utils/appError");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_ACCESS_TOKEN });

async function getGeometry(place) {
    const { body, statusCode } = await geocoder.forwardGeocode({
        query: place,
        limit: 1
    }).send();
    if (statusCode !== 200) {
        throw new AppError("Mapbox error", statusCode);
    }
    const feature = body?.features?.[0];
    if (!feature) {
        throw new Error("Cannot find the place");
    }
    return feature.geometry;
}

module.exports.getGeometry = getGeometry;