const Joi = require("joi");

const reviewJoiSchema = Joi.object({
    review: Joi.object({
        content: Joi.string().required(),
        rating: Joi.number().required(),
    }).required(),
})

module.exports = reviewJoiSchema;