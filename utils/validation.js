const Joi = require('joi');

// User validation schemas
const userSchema = {
  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('admin', 'client').default('client'),
    status: Joi.string().valid('active', 'inactive').default('active')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.ref('newPassword')
  })
};

// Client validation schemas
const clientSchema = {
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    nationality: Joi.string().required(),
    category: Joi.string().required(),
    address: Joi.object({
      postalCode: Joi.string().required(),
      prefecture: Joi.string().required(),
      city: Joi.string().required(),
      street: Joi.string().required(),
      building: Joi.string().allow('', null)
    }),
    socialMedia: Joi.object({
      facebook: Joi.string().allow('', null)
    }),
    modeOfContact: Joi.array().items(
      Joi.string().valid('Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger')
    )
  }),

  update: Joi.object({
    name: Joi.string(),
    phone: Joi.string(),
    nationality: Joi.string(),
    category: Joi.string(),
    address: Joi.object({
      postalCode: Joi.string(),
      prefecture: Joi.string(),
      city: Joi.string(),
      street: Joi.string(),
      building: Joi.string().allow('', null)
    }),
    socialMedia: Joi.object({
      facebook: Joi.string().allow('', null)
    }),
    modeOfContact: Joi.array().items(
      Joi.string().valid('Direct Call', 'Viber', 'WhatsApp', 'Facebook Messenger')
    ),
    status: Joi.string().valid('active', 'inactive')
  })
};

// Application validation schemas
const applicationSchema = {
  create: Joi.object({
    clientId: Joi.string().required(),
    type: Joi.string().valid('Visitor Visa', 'Student Visa').required(),
    country: Joi.string().required(),
    deadline: Joi.date().required(),
    documentStatus: Joi.string().valid('Not Yet', 'Few Received', 'Fully Received'),
    documentsToTranslate: Joi.number().min(0),
    translationStatus: Joi.string().valid('Under Process', 'Completed'),
    visaStatus: Joi.string().valid(
      'Under Review',
      'Under Process',
      'Waiting for Payment',
      'Completed',
      'Approved',
      'Rejected'
    ),
    handledBy: Joi.string().required(),
    payment: Joi.object({
      visaApplicationFee: Joi.number().min(0),
      translationFee: Joi.number().min(0),
      paidAmount: Joi.number().min(0),
      discount: Joi.number().min(0)
    }),
    notes: Joi.string().allow('', null)
  }),

  update: Joi.object({
    documentStatus: Joi.string().valid('Not Yet', 'Few Received', 'Fully Received'),
    documentsToTranslate: Joi.number().min(0),
    translationStatus: Joi.string().valid('Under Process', 'Completed'),
    visaStatus: Joi.string().valid(
      'Under Review',
      'Under Process',
      'Waiting for Payment',
      'Completed',
      'Approved',
      'Rejected'
    ),
    handledBy: Joi.string(),
    payment: Joi.object({
      visaApplicationFee: Joi.number().min(0),
      translationFee: Joi.number().min(0),
      paidAmount: Joi.number().min(0),
      discount: Joi.number().min(0)
    }),
    notes: Joi.string().allow('', null)
  })
};

// Appointment validation schemas
const appointmentSchema = {
  create: Joi.object({
    clientId: Joi.string().required(),
    type: Joi.string().required(),
    date: Joi.date().required(),
    time: Joi.string().required(),
    duration: Joi.number().min(15),
    meetingType: Joi.string().valid('physical', 'online').required(),
    location: Joi.string().when('meetingType', {
      is: 'physical',
      then: Joi.required()
    }),
    meetingLink: Joi.string().when('meetingType', {
      is: 'online',
      then: Joi.required()
    }),
    notes: Joi.string().allow('', null),
    isRecurring: Joi.boolean(),
    recurringFrequency: Joi.string().valid('weekly', 'biweekly', 'monthly').when('isRecurring', {
      is: true,
      then: Joi.required()
    }),
    reminderType: Joi.string().valid('email', 'sms', 'both')
  }),

  update: Joi.object({
    date: Joi.date(),
    time: Joi.string(),
    duration: Joi.number().min(15),
    status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled'),
    notes: Joi.string().allow('', null)
  })
};

module.exports = {
  userSchema,
  clientSchema,
  applicationSchema,
  appointmentSchema
};