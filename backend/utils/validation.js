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
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be a number greater than or equal to zero and less than one million')
    .isDecimal()
    .withMessage('Price must be a number greater than or equal to zero and less than one million'),
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
    .withMessage('Url must be a string')
    .isURL()
    .withMessage('Url must be a url')
    .isLength({ max: 255})
    .withMessage('Url must be less than 256 characters'),
  check('preview')
    .isBoolean()
    .withMessage('Preview must be a boolean'),
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

const validateMemberId = [
  check('memberId')
    .isInt({min: 1, allow_leading_zeroes: false})
    .withMessage("MemberId must be an integer greater than 0"),
  handleValidationErrors
];

const validateAttendeeStatus = [
  check('status')
    .isIn(['attending', 'waitlist', 'pending'])
    .withMessage("Status must be 'attending', 'waitlist', or 'pending'"),
  handleValidationErrors
];

const validateUserId = [
  check('userId')
    .isInt({min: 1, allow_leading_zeroes: false})
    .withMessage("UserId must be an integer greater than 0"),
  handleValidationErrors
];


const validatePagination = [
  check('page')
    .custom(async (value) => {
      if (value === undefined) {
        return true;
      } else if (!isNaN(value)) {
        return true;
      } else {
        throw new Error('Not a number')
        return false;
      }
    })
    .withMessage("Page must be greater than zero and should be less than 10"),
  check('size')
    .custom(async (value) => {
      if (value === undefined) {
        return true;
      } else if (!isNaN(value)) {
        return true;
      } else {
        throw new Error('Not a number')
        return false;
      }
    })
    .withMessage("Size must be greater than zero and should be less than 20"),
  check('name')
    .custom(async (value) => {
      if (value === undefined) {
        return true;
      } else if ((typeof value === 'string' || value instanceof String)) {
        const selectedEvent = await Event.findOne({where: {name: value} });
        if (!selectedEvent) throw new Error('Blah blah');
        // ^ seems like throwing the error is what works, not the message itself
        return !!selectedEvent;
      }
    })
    .withMessage('Name must be an actual name of at least one event'),
  check('type')
    .custom(async (value) => {
      if (value === undefined) {
        return true;
      } else if ((typeof value === 'string' || value instanceof String)) {
        if (value === 'Online' || value === 'In person') {
          return true;
        } else {
          throw new Error('Not in the list of values');
        // ^ seems like throwing the error is what works, not the message itself
          return !!selectedEvent;
        }
      }
    })
    .withMessage("Type must be a string of either 'Online' or 'In person'"),
  check('startDate')
    .custom(async (value) => {
      if (value === undefined) return true;
      else {
        const supposedDate = value.split(' ').join('T') + 'Z';
        const isBadDate = isNaN(Date.parse(supposedDate));
        if (isBadDate) throw new Error("blah blah");
        return isBadDate;
      }
    })
    .withMessage("Start date must be a valid date or null"),
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
  validateAttendeeStatus,
  validateMemberId,
  validateUserId,
  validatePagination
};
