"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unAuthentication =
  exports.notFound =
  exports.CustomError =
  exports.paginationResponse =
  exports.customResponse =
  exports.customSuccess =
  exports.success =
  exports.error =
    void 0;

const en_messages_1 = require("../helper/resources/en_messages");
const constants_1 = require("./constants");

// Get localized message
const getMessage = (languageCode, code, defaultcode) => {
  if (languageCode == "en") {
    return en_messages_1.en[code]
      ? en_messages_1.en[code]
      : en_messages_1.en[defaultcode];
  }
};

// Reusable response sender
function sendResponse(
  languageCode,
  res,
  message,
  statusCode,
  data = {},
  isError = false
) {
  const resData = {
    statusCode,
    error: isError,
    message: getMessage(languageCode, message, "DEFAULT"),
    data,
  };
  return res.status(statusCode).json(resData);
}

// Error response (default status 400)
const error = (languageCode, res, message, statusCode = 400, data = {}) => {
  return sendResponse(languageCode, res, message, statusCode, data, true);
};
exports.error = error;

// Success response (default status 200)
const success = (
  languageCode = constants_1.LANGUAGE_CODE.EN,
  res,
  message,
  statusCode = 200,
  data = {}
) => {
  return sendResponse(languageCode, res, message, statusCode, data, false);
};
exports.success = success;

// Custom success with pre-built response
const customSuccess = (res, response) => {
  return res.status(200).json(response);
};
exports.customSuccess = customSuccess;

// Duplicate of error response, now reused
const customResponse = (
  languageCode = constants_1.LANGUAGE_CODE.EN,
  res,
  message,
  statusCode = 200,
  data = {}
) => {
  return sendResponse(languageCode, res, message, statusCode, data, true);
};
exports.customResponse = customResponse;

// Paginated data response
const paginationResponse = (
  languageCode = constants_1.LANGUAGE_CODE.EN,
  res,
  message,
  statusCode = 200,
  data = []
) => {
  data.data = data.list;
  delete data.list;
  const resData = {
    statusCode: statusCode,
    error: true,
    message: getMessage(languageCode, message, "DEFAULT"),
    ...data,
  };
  return res.status(statusCode).json(resData);
};
exports.paginationResponse = paginationResponse;

// Custom error with fallback code/message
const CustomError = (
  languageCode = constants_1.LANGUAGE_CODE.EN,
  res,
  code = "",
  statusCode = 400,
  data = {},
  message
) => {
  const resData = {
    statusCode: statusCode,
    error: false,
    message: getMessage(languageCode, message, "DEFAULT"),
    data: data,
  };
  return res.status(statusCode).json(resData);
};
exports.CustomError = CustomError;

// 404 Not Found handler
const notFound = (
  languageCode = constants_1.LANGUAGE_CODE.EN,
  res,
  code,
  statusCode = 404
) => {
  const resData = {
    statusCode: statusCode,
    error: false,
    message:
      getMessage(languageCode, "", "DEFAULTER") || "Invalid request data",
    data: {},
  };
  return res.status(statusCode).send(resData);
};
exports.notFound = notFound;

// 401 Unauthorized handler
const unAuthentication = (
  languageCode = constants_1.LANGUAGE_CODE.EN,
  res,
  message,
  statusCode = 401,
  data = {}
) => {
  const resData = {
    statusCode: statusCode,
    error: false,
    message: getMessage(languageCode, message, "DEFAULT_AUTH"),
    data,
  };
  return res.status(statusCode).json(resData);
};
exports.unAuthentication = unAuthentication;
