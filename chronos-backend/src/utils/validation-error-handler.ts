import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

// Define mapping for common validation errors to user-friendly messages
const validationErrorMessages: Record<string, Record<string, string>> = {
    // Auth fields
    email: {
        format: 'Please enter a valid email address',
        type: 'Email must be text',
        required: 'Email address is required',
    },
    username: {
        minLength: 'Username must be at least 3 characters long',
        maxLength: 'Username cannot exceed 30 characters',
        type: 'Username must be text',
        required: 'Username is required',
    },
    password: {
        minLength: 'Password must be at least 8 characters long',
        type: 'Password must be text',
        required: 'Password is required',
    },
    fullName: {
        type: 'Full name must be text',
    },
    region: {
        type: 'Please select a valid region',
    },
    code: {
        pattern: 'Verification code must be a 6-digit number',
        required: 'Verification code is required',
    },
    token: {
        required: 'Token is missing or invalid',
    },
    currentPassword: {
        required: 'Current password is required',
        minLength: 'Current password must be at least 8 characters long',
    },
    newPassword: {
        required: 'New password is required',
        minLength: 'New password must be at least 8 characters long',
    },
    newEmail: {
        format: 'Please enter a valid new email address',
        required: 'New email address is required',
    },

    // Calendar and Category fields
    name: {
        required: 'Name is required',
        type: 'Name must be text',
    },
    color: {
        required: 'Color is required',
        pattern: 'Color must be a valid hex color (e.g., #FF5733)',
        type: 'Color must be text',
    },
    description: {
        type: 'Description must be text',
    },
    id: {
        required: 'ID is required',
        format: 'Invalid ID format',
    },
    isVisible: {
        required: 'Visibility setting is required',
        type: 'Visibility must be true or false',
    },
    calendarId: {
        required: 'Calendar ID is required',
        format: 'Invalid calendar ID format',
    },

    // Event fields
    categoryId: {
        required: 'Category is required',
        format: 'Invalid category ID format',
    },
    startDate: {
        required: 'Start date is required',
        format: 'Start date must be a valid date and time',
        type: 'Start date must be a valid date string',
    },
    endDate: {
        required: 'End date is required',
        format: 'End date must be a valid date and time',
        type: 'End date must be a valid date string',
    },
    isCompleted: {
        type: 'Completion status must be true or false',
    },
    invitees: {
        type: 'Invitees must be a list of user IDs',
        items: 'Invalid user ID in invitees list',
    },

    // Participant and invitation fields
    role: {
        required: 'Role is required',
        enum: 'Invalid role. Please select a valid role.',
        type: 'Role must be text',
    },
    expireInDays: {
        type: 'Expiration days must be a number',
        minimum: 'Expiration days must be at least 1',
    },
    userId: {
        required: 'User ID is required',
        format: 'Invalid user ID format',
    },
    linkId: {
        required: 'Link ID is required',
        format: 'Invalid link ID format',
    },
    inviteId: {
        required: 'Invite ID is required',
        format: 'Invalid invite ID format',
    },
};

// Generic fallback messages for different error types
const fallbackMessages: Record<string, string> = {
    format: 'The value is in an invalid format',
    required: 'This field is required',
    minLength: 'This field is too short',
    maxLength: 'This field is too long',
    pattern: 'The value does not match the required pattern',
    type: 'The value is of an incorrect type',
    enum: 'The value is not one of the allowed options',
    minimum: 'The value is too small',
    maximum: 'The value is too large',
    additionalProperties: 'Additional properties are not allowed',
    items: 'One or more items in the array are invalid',
};

/**
 * Extract field name from validation error path or parameters
 */
function extractFieldName(validation: any): { fieldName: string; keyword: string } {
    let fieldName = '';
    let keyword = validation.keyword;

    // Try to extract from instancePath
    if (validation.instancePath) {
        const matches = validation.instancePath.match(/\/([\w]+)(?:\/\d+)?$/);
        fieldName = matches ? matches[1] : '';

        // Special handling for array item errors
        if (validation.instancePath.includes('/items/') || validation.instancePath.includes('/0')) {
            keyword = 'items';
            // Try to identify the array field name
            const arrayMatches = validation.instancePath.match(/\/([\w]+)\/\d+/);
            if (arrayMatches) {
                fieldName = arrayMatches[1];
            }
        }
    }
    // Try to extract from params.missingProperty
    else if (validation.params && validation.params.missingProperty) {
        fieldName = validation.params.missingProperty as string;
        keyword = 'required';
    }
    // Try to extract from params.additionalProperty
    else if (validation.params && validation.params.additionalProperty) {
        fieldName = validation.params.additionalProperty as string;
        keyword = 'additionalProperties';
    }
    // Try to extract from error message
    else {
        // Example: "body/email must match format "email""
        const msgMatch = validation.message?.match(/body\/([\w]+) must/);
        if (msgMatch) {
            fieldName = msgMatch[1];

            // Determine the error type from the message
            if (validation.message?.includes('must match format')) {
                keyword = 'format';
            } else if (validation.message?.includes('must have')) {
                keyword = 'required';
            } else if (validation.message?.includes('must be equal to one of')) {
                keyword = 'enum';
            }
        }
    }

    return { fieldName, keyword };
}

/**
 * Format field name for display (camelCase to Title Case)
 */
function formatFieldName(fieldName: string): string {
    return fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

/**
 * Custom error handler for validation errors
 */
export function validationErrorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
    // Handle validation errors
    if (error.validation && error.validation.length > 0) {
        const validation = error.validation[0];

        // Extract field name and keyword
        const { fieldName, keyword } = extractFieldName(validation);

        // Get a user-friendly message
        let message = '';

        // Try field-specific message
        if (fieldName && validationErrorMessages[fieldName] && validationErrorMessages[fieldName][keyword]) {
            message = validationErrorMessages[fieldName][keyword];
        }
        // Try generic message for this error type
        else if (fallbackMessages[keyword]) {
            message = fallbackMessages[keyword];
            if (fieldName) {
                message = `${formatFieldName(fieldName)}: ${message}`;
            }
        }
        // Ultimate fallback
        else {
            message = `Invalid input: ${error.message}`;
        }

        // Log the validation error in development
        if (process.env.NODE_ENV === 'development') {
            console.log('Validation error:', {
                message,
                original: error.message,
                validation,
            });
        }

        // Send a structured error response
        return reply.status(400).send({
            status: 'error',
            message: message,
            // Include original details in development but not in production
            ...(process.env.NODE_ENV === 'development'
                ? {
                      detail: validation,
                  }
                : {}),
        });
    }

    // If it's not a validation error, pass it through
    return reply.send(error);
}
