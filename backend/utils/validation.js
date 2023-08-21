const { validationResult, check } = require('express-validator');
const { User, Group, Image, Venue, GroupMember, Event } = require('../db/models');

// Middleware for formatting errors from express-validator middleware
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    next(err);
  }
  next();
}

const validateGroup = [
  check('name')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 1, max: 60})
    .withMessage('Name must be 60 characters or less'),
    check('about')
    .isString()
    .withMessage('About must be a string')
    .isLength({ min: 50 })
    .withMessage('About must be 50 characters or more.'),
  check('type')
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('private')
    .isBoolean()
    .withMessage('Private must be a boolean'),
  check('city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  check('state')
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be exactly 2 uppercase characters')
    .isUppercase()
    .withMessage('State must be exactly 2 uppercase characters'),
  handleValidationErrors
];

const validateVenue = [
  check('address')
    .isString()
    .withMessage('Address must be a string')
    .isLength({ min: 1, max: 255})
    .withMessage('Address must be at least 1 character and less than 256 characters'),
  check('city')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  check('state')
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be exactly 2 uppercase characters')
    .isUppercase()
    .withMessage('State must be exactly 2 uppercase characters'),
  check('lat')
    .isFloat({ min: -90, max: 90})
    .withMessage('Latitude must be a decimal number between -90 and 90')
    .isDecimal()
    .withMessage('Latitude must be a decimal number between -90 and 90'),
  check('lng')
    .isFloat({ min: -180, max: 180})
    .withMessage('Longitude (lng) must be a decimal number between -180 and 180')
    .isDecimal()
    .withMessage('Longitude (lng) must be a decimal number between -180 and 180'),
  handleValidationErrors
];

const validateEvent = [
  check('venueId')
    .isInt({ min: 1, allow_leading_zeroes: false })
    .withMessage('Venue does not exist')
    .custom(async (value) => {
      const selectedVenue = await Venue.findByPk(value);
      if (!selectedVenue) throw new Error('Blah blah');
      // ^ seems like throwing the error is what works, not the message itself
      return !!selectedVenue;
    })
    .withMessage('Venue does not exist'),
  check('name')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 5, max: 255})
    .withMessage('Name must be at least 5 characters and less than 256 characters'),
  check('description')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 1, max: 255})
    .withMessage('Description is required and must be less than 256 characters'),
  check('type')
    .isIn(['Online', 'In person'])
    .withMessage("Type must be 'Online' or 'In person'"),
  check('capacity')
    .isInt({ min: 2})
    .withMessage('Capacity must be an integer greater than 1'),
  check('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to zero')
    .isDecimal()
    .withMessage('Price must be a number greater than or equal to zero'),
  check('startDate')
    .isAfter()
    .withMessage('Start date must be in the future'),
  check('endDate')
    .custom((value, { req }) => {
      return (value > req.body.startDate);
    })
    .withMessage('End date must be after start date'),
  handleValidationErrors
];

const validateImage = [
  check('url')
    .exists({ checkFalsy: true })
    .isString()
    .isURL()
    .isLength({ max: 255})
    .withMessage('Url must be a url'),
  check('preview')
    .isBoolean()
    .withMessage('Private must be a boolean'),
  handleValidationErrors
];

const validateGroupId = [
  check('groupId')
    .isInt({min: 1, allow_leading_zeroes: false})
    .withMessage("Invalid group number"),
  handleValidationErrors
];

const validateMemberStatus = [
  check('status')
    .isIn(['co-host', 'member', 'pending'])
    .withMessage("Status must be 'co-host', 'member', or 'pending'"),
  handleValidationErrors
];

const validateAttendeeStatus = [
  check('status')
    .isIn(['attending', 'waitlist', 'pending'])
    .withMessage("Status must be 'attending', 'waitlist', or 'pending'"),
  handleValidationErrors
];


module.exports = {
  handleValidationErrors,
  validateGroup,
  validateVenue,
  validateEvent,
  validateImage,
  validateGroupId,
  validateMemberStatus,
  validateAttendeeStatus
};
