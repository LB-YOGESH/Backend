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
    const { answerId, upVote, downVote } = req.params;
    const rating = upVote - downVote;
    let data4createResponseObject;
    try {
      const currentUser = await global.models.GLOBAL.USER.findById({
        _id: user._id,
      });
      const updateAnswer = await global.models.GLOBAL.ANSWER.findByIdAndUpdate(
        { _id: answerId },
        {
          $set: {
            downVote: downVote,
            upVote: upVote,
            rating: rating,
          },
        },
        { new: true }
      );
      if (currentUser.downVotedAnswers.includes(answerId)) {
        const saveVote = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $push: {
              upVotedAnswers: answerId,
            },
            $pull: {
              downVotedAnswers: answerId,
            },
          }
        );
        data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.VOTE_CHANGE,
          payload: { updateAnswer },
          logPayload: false,
        };
      } else {
        const saveVote = await global.models.GLOBAL.USER.findByIdAndUpdate(
          { _id: user._id },
          {
            $push: {
              upVotedAnswers: answerId,
            },
          }
        );
        data4createResponseObject = {
          req: req,
          result: 0,
          message: messages.VOTE_SUCCESS,
          payload: { updateAnswer },
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
