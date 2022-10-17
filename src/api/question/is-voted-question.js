const Joi = require("joi");
const enums = require("../../../json/enums.json");
const messages = require("../../../json/messages.json");

const logger = require("../../logger");
const utils = require("../../utils");

// Add category by admin
module.exports = exports = {
  // route validation
  validation: Joi.object({
    question: Joi.string().allow(),
    displayProfile: Joi.boolean().allow(),
    allowConnectionRequest: Joi.boolean().allow(),
    filter: Joi.array().allow(),
  }),

  // route handler
  handler: async (req, res) => {
    const { user } = req;
    const { questionId } = req.params;

    try {
      const currentUser = await global.models.GLOBAL.USER.findById({
        _id: user._id,
      });
      let data4createResponseObject;
      if (currentUser.upVotedQuestions.includes(questionId)) {
        const voted = 1;
        data4createResponseObject = {
          req: req,
          result: 1,
          payload: { voted },
          logPayload: false,
        };
      }
      if (currentUser.downVotedQuestions.includes(questionId)) {
        const voted = -1;
        data4createResponseObject = {
          req: req,
          result: 1,
          payload: { voted },
          logPayload: false,
        };
      }
      if (
        !currentUser.upVotedQuestions.includes(questionId) &&
        !currentUser.downVotedQuestions.includes(questionId)
      ) {
        const voted = 0;
        data4createResponseObject = {
          req: req,
          result: 0,
          payload: { voted },
          logPayload: false,
        };
      }
      res
        .status(enums.HTTP_CODES.OK)
        .json(utils.createResponseObject(data4createResponseObject));
    } catch (error) {
      logger.error(
        `${req.originalUrl} - Error encountered: ${error.message}\n${error.stack}`
      );
      const data4createResponseObject = {
        req: req,
        result: -1,
        message: messages.GENERAL,
        payload: {},
        logPayload: false,
      };
      res
        .status(enums.HTTP_CODES.INTERNAL_SERVER_ERROR)
        .json(utils.createResponseObject(data4createResponseObject));
    }
  },
};
