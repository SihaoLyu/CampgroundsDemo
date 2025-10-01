const Joi = require("./baseJoi");

const campgroundJoiSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().allow("").escapeHTML(), // Allow empty string
    }).required(),
}).unknown(true);

module.exports = campgroundJoiSchema;