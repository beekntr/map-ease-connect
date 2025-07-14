const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  createTenant: Joi.object({
    placeName: Joi.string().required().min(2).max(100),
    subdomain: Joi.string().required().min(2).max(50).pattern(/^[a-z0-9-]+$/),
  }),

  createEvent: Joi.object({
    eventName: Joi.string().required().min(2).max(200),
    locationName: Joi.string().required().min(2).max(200),
    eventType: Joi.string().valid('OPEN', 'CLOSED').default('OPEN'),
    description: Joi.string().max(1000).allow(''),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).allow(null)
  }),

  registerForEvent: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-\(\)]+$/).max(20).allow('')
  }),

  assignTenantAdmin: Joi.object({
    email: Joi.string().email().required(),
    tenantId: Joi.string().required()
  }),

  scanQR: Joi.object({
    qrCode: Joi.string().required()
  })
};

module.exports = {
  validateRequest,
  schemas
};
