const Joi = require('joi');

const leadSchema = Joi.object({
  first_name: Joi.string().required().min(1).max(100),
  last_name: Joi.string().required().min(1).max(100),
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(''),
  company: Joi.string().optional().allow(''),
  message: Joi.string().optional().allow(''),
  source: Joi.string().optional().default('website')
});

function validateLead(data) {
  const { error, value } = leadSchema.validate(data, { abortEarly: false });
  
  if (error) {
    const validationError = new Error('Validation failed');
    validationError.name = 'ValidationError';
    validationError.details = error.details.map(d => d.message);
    throw validationError;
  }
  
  return value;
}

module.exports = { validateLead, leadSchema };
