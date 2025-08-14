const Joi = require("joi");

module.exports.reviewJoiSchema = Joi.object({
    review: Joi.object({
        content: Joi.string().required(),
        rating: Joi.number().required(),
    }).required(),
})