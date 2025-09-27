import Joi from 'joi';

// User registration validation schema
export const validateRegistration = (data: any) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters and spaces',
        'any.required': 'First name is required',
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters and spaces',
        'any.required': 'Last name is required',
      }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future',
      }),
    address: Joi.string()
      .max(255)
      .optional()
      .messages({
        'string.max': 'Address cannot exceed 255 characters',
      }),
    role: Joi.string()
      .valid('CITIZEN', 'ADMIN', 'STAFF', 'HEALTH_STAFF', 'BUSINESS_STAFF', 'EDUCATION_STAFF')
      .default('CITIZEN')
      .optional(),
  });

  return schema.validate(data);
};

// User login validation schema
export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  });

  return schema.validate(data);
};

// Profile update validation schema
export const validateProfileUpdate = (data: any) => {
  const schema = Joi.object({
    firstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .optional()
      .messages({
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'string.pattern.base': 'First name can only contain letters and spaces',
      }),
    lastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .optional()
      .messages({
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'string.pattern.base': 'Last name can only contain letters and spaces',
      }),
    phoneNumber: Joi.string()
      .pattern(/^\+?[\d\s\-\(\)]{10,15}$/)
      .allow(null, '')
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
      }),
    dateOfBirth: Joi.date()
      .max('now')
      .allow(null)
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future',
      }),
    address: Joi.string()
      .max(255)
      .allow(null, '')
      .optional()
      .messages({
        'string.max': 'Address cannot exceed 255 characters',
      }),
  });

  return schema.validate(data);
};

// Password change validation schema
export const validatePasswordChange = (data: any) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required',
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'New password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Password confirmation does not match new password',
        'any.required': 'Password confirmation is required',
      }),
  });

  return schema.validate(data);
};

// Identification letter validation schema
export const validateIdentificationLetter = (data: any) => {
  const schema = Joi.object({
    purpose: Joi.string()
      .min(10)
      .max(500)
      .required()
      .messages({
        'string.min': 'Purpose must be at least 10 characters long',
        'string.max': 'Purpose cannot exceed 500 characters',
        'any.required': 'Purpose is required',
      }),
    documents: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one document is required',
        'any.required': 'Documents are required',
      }),
  });

  return schema.validate(data);
};

// Birth certificate validation schema
export const validateBirthCertificate = (data: any) => {
  const schema = Joi.object({
    childFirstName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Child first name must be at least 2 characters long',
        'string.max': 'Child first name cannot exceed 50 characters',
        'string.pattern.base': 'Child first name can only contain letters and spaces',
        'any.required': 'Child first name is required',
      }),
    childLastName: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Child last name must be at least 2 characters long',
        'string.max': 'Child last name cannot exceed 50 characters',
        'string.pattern.base': 'Child last name can only contain letters and spaces',
        'any.required': 'Child last name is required',
      }),
    childDateOfBirth: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'Date of birth cannot be in the future',
        'any.required': 'Child date of birth is required',
      }),
    placeOfBirth: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Place of birth must be at least 2 characters long',
        'string.max': 'Place of birth cannot exceed 100 characters',
        'any.required': 'Place of birth is required',
      }),
    fatherName: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Father name must be at least 2 characters long',
        'string.max': 'Father name cannot exceed 100 characters',
        'string.pattern.base': 'Father name can only contain letters and spaces',
        'any.required': 'Father name is required',
      }),
    motherName: Joi.string()
      .min(2)
      .max(100)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
      .messages({
        'string.min': 'Mother name must be at least 2 characters long',
        'string.max': 'Mother name cannot exceed 100 characters',
        'string.pattern.base': 'Mother name can only contain letters and spaces',
        'any.required': 'Mother name is required',
      }),
    documents: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one document is required',
        'any.required': 'Documents are required',
      }),
  });

  return schema.validate(data);
};

// Health appointment validation schema
export const validateHealthAppointment = (data: any) => {
  const schema = Joi.object({
    healthCenterId: Joi.string()
      .required()
      .messages({
        'any.required': 'Health center is required',
      }),
    appointmentDate: Joi.date()
      .min('now')
      .required()
      .messages({
        'date.min': 'Appointment date cannot be in the past',
        'any.required': 'Appointment date is required',
      }),
    serviceType: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Service type must be at least 2 characters long',
        'string.max': 'Service type cannot exceed 100 characters',
        'any.required': 'Service type is required',
      }),
    notes: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Notes cannot exceed 500 characters',
      }),
  });

  return schema.validate(data);
};

// Business registration validation schema
export const validateBusinessRegistration = (data: any) => {
  const schema = Joi.object({
    businessName: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Business name must be at least 2 characters long',
        'string.max': 'Business name cannot exceed 100 characters',
        'any.required': 'Business name is required',
      }),
    businessType: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Business type must be at least 2 characters long',
        'string.max': 'Business type cannot exceed 50 characters',
        'any.required': 'Business type is required',
      }),
    businessAddress: Joi.string()
      .min(5)
      .max(255)
      .required()
      .messages({
        'string.min': 'Business address must be at least 5 characters long',
        'string.max': 'Business address cannot exceed 255 characters',
        'any.required': 'Business address is required',
      }),
    documents: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one document is required',
        'any.required': 'Documents are required',
      }),
  });

  return schema.validate(data);
};

// Vehicle registration validation schema
export const validateVehicleRegistration = (data: any) => {
  const schema = Joi.object({
    vehicleType: Joi.string()
      .valid('CAR', 'TRUCK', 'MOTORCYCLE', 'BUS', 'VAN', 'OTHER')
      .required()
      .messages({
        'any.only': 'Please select a valid vehicle type',
        'any.required': 'Vehicle type is required',
      }),
    vehicleMake: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Vehicle make must be at least 2 characters long',
        'string.max': 'Vehicle make cannot exceed 50 characters',
        'any.required': 'Vehicle make is required',
      }),
    vehicleModel: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Vehicle model must be at least 2 characters long',
        'string.max': 'Vehicle model cannot exceed 50 characters',
        'any.required': 'Vehicle model is required',
      }),
    vehicleYear: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear() + 1)
      .required()
      .messages({
        'number.min': 'Vehicle year must be 1900 or later',
        'number.max': 'Vehicle year cannot be in the future',
        'any.required': 'Vehicle year is required',
      }),
    documents: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one document is required',
        'any.required': 'Documents are required',
      }),
  });

  return schema.validate(data);
};

// Complaint validation schema
export const validateComplaint = (data: any) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required()
      .messages({
        'string.min': 'Title must be at least 5 characters long',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Title is required',
      }),
    description: Joi.string()
      .min(10)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Description must be at least 10 characters long',
        'string.max': 'Description cannot exceed 1000 characters',
        'any.required': 'Description is required',
      }),
    category: Joi.string()
      .valid('INFRASTRUCTURE', 'PUBLIC_HEALTH', 'SECURITY', 'EDUCATION', 'TRANSPORT', 'WASTE_MANAGEMENT', 'UTILITIES', 'OTHER')
      .required()
      .messages({
        'any.only': 'Please select a valid complaint category',
        'any.required': 'Category is required',
      }),
    priority: Joi.string()
      .valid('LOW', 'NORMAL', 'HIGH', 'URGENT')
      .default('NORMAL')
      .optional(),
    attachments: Joi.array()
      .items(Joi.string().uri())
      .max(5)
      .optional()
      .messages({
        'array.max': 'Maximum 5 attachments allowed',
      }),
  });

  return schema.validate(data);
};

// General query validation
export const validateQuery = (data: any) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(100).optional(),
    status: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  });

  return schema.validate(data);
};
