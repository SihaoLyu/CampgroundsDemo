const Joi = require("joi");

const campgroundJoiSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        image: Joi.string().uri().required(),
        description: Joi.string().allow(""), // Allow empty string
    }).required(),
});

module.exports = campgroundJoiSchema;