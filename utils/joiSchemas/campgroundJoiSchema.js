const Joi = require("joi");

const campgroundJoiSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        description: Joi.string().allow(""), // Allow empty string
    }).required(),
}).unknown(true);

module.exports = campgroundJoiSchema;