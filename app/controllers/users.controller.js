const Joi = require("joi");
const BusinessUser = require("../service/users.service");
const businessUser = new BusinessUser();
const { profileConstants } = require("../utils/constants.js")

exports.registerUser = async (req, res) => {
  const reqBody = req.body;

  const schema = Joi.object().keys({
    name: Joi.string()
      .required()
      .error(new Error("name is a mandatory parameter.")),
    email: Joi.string()
      .email()
      .required()
      .error(new Error("email is a mandatory parameter.")),
    gender: Joi.string()
      .required()
      .error(new Error("gender is a mandatory parameter.")),
    phone: Joi.string()
      .length(10)
      .required()
      .options({
        messages: {
          "any.required": "phone is a mandatory parameter.",
          "any.length": "phone must be of 10 digits.",
        },
      }),
    password: Joi.string()
      .required()
      .error(new Error("password is a mandatory parameter.")),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .label("Confirm password")
      .options({
        messages: {
          "any.only": "{{#label}} does not match",
          "any.required": "confirmPassword is a mandatory parameter",
        },
      }),
  });

  const schemaResult = schema.validate(reqBody);

  if (schemaResult.error) {
    res.status(422).json({
      statusCode: 422,
      status: "error",
      message: schemaResult.error.message,
    });
  }else {
    const result = await businessUser.registerUser(reqBody)
    res.status(result?.statusCode || 500).json(result)
  }
};

exports.loginUser = async (req, res) => {
  const reqBody = req.body;

  const schema = Joi.object().keys({
    email: Joi.string()
      .required()
      .error(new Error("email is a mandatory parameter.")),
    password: Joi.string()
      .required()
      .error(new Error("password is a mandatory parameter.")),
  });

  const schemaResult = schema.validate(reqBody);

  if (schemaResult.error) {
    res.status(422).json({
      statusCode: 422,
      status: "error",
      message: schemaResult.error.message,
    });
  } else {
    const result = await businessUser.loginUser(reqBody);
    res.status(result?.statusCode || 500).json(result);
  }
};

exports.listAllUsers = async (req, res) => {
  const result = await businessUser.listAllUser();
  res.status(result?.statusCode || 500).json(result);
};

exports.updateUserProfile = async (req, res) => {
  const reqBody = req.body;

  const schema = Joi.object().keys({
    name: Joi.string(),
    phone: Joi.string()
      .length(10)
      .options({ messages: { "any.length": "mobile must be of 10 digits." } }),
    // status: Joi.string().valid(profileConstants.UserProfileStatus.Registered , profileConstants.UserProfileStatus.KycCompleted), 
    gender: Joi.string().valid(profileConstants.Gender.Male, profileConstants.Gender.Female, profileConstants.Gender.Other)
  });

  const schemaResult = schema.validate(reqBody);

  if (schemaResult.error) {
    res.status(422).json({
      statusCode: 422,
      status: "error",
      message: schemaResult.error.message,
    });
  }else {
    reqBody.email = req.email
    const result = await businessUser.profileUpdate(reqBody)
    res.status(result?.statusCode || 500).json(result)
  }
};

exports.changePassword = async (req, res) => {
  const reqBody = req.body;

  const schema = Joi.object().keys({
    password: Joi.string()
      .required()
      .error(new Error("passwrord is a mandatory parameter.")),
    newPassword: Joi.string()
      .required()
      .invalid(Joi.ref("password"))
      .options({
        messages: {
          "any.invalid": "newPassword and password cannot be same",
          "any.required": "newPassword is a mandatory parameter",
        },
      }),
  });

  const schemaResult = schema.validate(reqBody);

  if (schemaResult.error) {
    res.status(422).json({
      statusCode: 422,
      status: "error",
      message: schemaResult.error.message,
    });
  } else {
    reqBody.email = req.email
    const result = await businessUser.changePassword(reqBody);
    res.status(result?.statusCode || 500).json(result);
  }
};

exports.resetPassword = async (req, res) => {
  const reqBody = req.body;

  const schema = Joi.object().keys({
    username: Joi.string()
      .required()
      .error(new Error("username is a mandatory parameter.")),
    otp: Joi.number()
    .required()
    .error(new Error("otp is a mandatory parameter.")),
    newPassword: Joi.string()
      .required()
      .error(new Error("newPassword is a mandatory parameter.")),
  });

  const schemaResult = schema.validate(reqBody);

  if (schemaResult.error) {
    res.status(422).json({
      statusCode: 422,
      status: "error",
      message: schemaResult.error.message,
    });
  } else {
    const result = await businessUser.resetPassword(reqBody);
    res.status(result?.statusCode || 500).json(result);
  }
};

exports.getuserDetails = async (req, res) => {
  const reqBody = {
    email: req.email,
  };
  
  const result = await businessUser.getProfileDetails(reqBody);
  res.status(result?.statusCode || 500).json(result);
};

exports.uploadProfileImage = async (req, res) => {
  const reqBody = {
    username: req.username,
  };
  // console.log( req.protocol + '://' + req.get('host') + req.originalUrl)
  
  const result = await businessUser.uploadProfileImage(reqBody, req);
  res.status(result?.statusCode || 500).json(result);
};

exports.deleteProfileImage = async (req, res) => {
  const reqBody = {
    username: req.username,
  };
  
  const result = await businessUser.deleteProfileImage(reqBody);
  res.status(result?.statusCode || 500).json(result);
};


exports.findUserProfile = async (req, res) => {
  const reqBody = {
    username: req.query.username,
    email: req.query.email,
  };
  const result = await businessUser.findUserProfile(reqBody);
  res.status(result?.statusCode || 500).json(result);
};

exports.userCSV = async (req, res) => {

  const result = await businessUser.listAllUser()

  console.log(result.data)
  // Generate CSV content
  const csvData = result.data.map(user =>
    `${user.id},${user.name},${user.email},${user.gender},${user.status},${user.phone}`
  ).join('\n');

  // Set response headers for CSV download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');

  // Stream CSV data to the response
  res.send(csvData);
};
