const Joi = require("./baseJoi");

const reviewJoiSchema = Joi.object({
    review: Joi.object({
        content: Joi.string().required().escapeHTML(),
        rating: Joi.number().required(),
    }).required(),
})

module.exports = reviewJoiSchema;