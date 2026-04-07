import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
} from '../../../src/lib/errors';

describe('AppError', () => {
  it('should create an error with statusCode, message, and code', () => {
    const err = new AppError(500, 'Something went wrong', 'INTERNAL');

    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('Something went wrong');
    expect(err.code).toBe('INTERNAL');
    expect(err.name).toBe('AppError');
  });

  it('should extend Error', () => {
    const err = new AppError(500, 'test');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('should allow code to be undefined', () => {
    const err = new AppError(422, 'no code');

    expect(err.code).toBeUndefined();
  });

  it('should have a stack trace', () => {
    const err = new AppError(500, 'trace check');

    expect(err.stack).toBeDefined();
    expect(err.stack).toContain('trace check');
  });
});

describe('NotFoundError', () => {
  it('should have status 404 and NOT_FOUND code', () => {
    const err = new NotFoundError('User');

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.name).toBe('NotFoundError');
  });

  it('should format message with resource name only', () => {
    const err = new NotFoundError('Content');

    expect(err.message).toBe('Content not found');
  });

  it('should format message with resource name and id', () => {
    const err = new NotFoundError('Content', 'abc-123');

    expect(err.message).toBe("Content with id 'abc-123' not found");
  });

  it('should extend AppError and Error', () => {
    const err = new NotFoundError('Widget');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(NotFoundError);
  });
});

describe('ValidationError', () => {
  it('should have status 400 and VALIDATION_ERROR code', () => {
    const err = new ValidationError('Invalid input');

    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.name).toBe('ValidationError');
  });

  it('should store details object with field-level errors', () => {
    const details = {
      email: ['Email is required', 'Must be a valid email'],
      name: ['Name is too short'],
    };
    const err = new ValidationError('Validation failed', details);

    expect(err.details).toBe(details);
    expect(err.details?.email).toHaveLength(2);
    expect(err.details?.name).toEqual(['Name is too short']);
  });

  it('should allow details to be undefined', () => {
    const err = new ValidationError('Bad request');

    expect(err.details).toBeUndefined();
  });

  it('should extend AppError and Error', () => {
    const err = new ValidationError('test');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(ValidationError);
  });
});

describe('UnauthorizedError', () => {
  it('should have status 401 and UNAUTHORIZED code', () => {
    const err = new UnauthorizedError();

    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.name).toBe('UnauthorizedError');
  });

  it('should use default message when none provided', () => {
    const err = new UnauthorizedError();

    expect(err.message).toBe('Authentication required');
  });

  it('should accept custom message', () => {
    const err = new UnauthorizedError('Token expired');

    expect(err.message).toBe('Token expired');
  });

  it('should extend AppError and Error', () => {
    const err = new UnauthorizedError();

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(UnauthorizedError);
  });
});

describe('ForbiddenError', () => {
  it('should have status 403 and FORBIDDEN code', () => {
    const err = new ForbiddenError();

    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
    expect(err.name).toBe('ForbiddenError');
  });

  it('should use default message when none provided', () => {
    const err = new ForbiddenError();

    expect(err.message).toBe('Insufficient permissions');
  });

  it('should accept custom message', () => {
    const err = new ForbiddenError('Admin only');

    expect(err.message).toBe('Admin only');
  });

  it('should extend AppError and Error', () => {
    const err = new ForbiddenError();

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(ForbiddenError);
  });
});

describe('ConflictError', () => {
  it('should have status 409 and CONFLICT code', () => {
    const err = new ConflictError('Resource already exists');

    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.name).toBe('ConflictError');
  });

  it('should store the provided message', () => {
    const err = new ConflictError('Duplicate email');

    expect(err.message).toBe('Duplicate email');
  });

  it('should extend AppError and Error', () => {
    const err = new ConflictError('conflict');

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(ConflictError);
  });
});

describe('RateLimitError', () => {
  it('should have status 429 and RATE_LIMIT code', () => {
    const err = new RateLimitError();

    expect(err.statusCode).toBe(429);
    expect(err.code).toBe('RATE_LIMIT');
    expect(err.name).toBe('RateLimitError');
  });

  it('should use default message when none provided', () => {
    const err = new RateLimitError();

    expect(err.message).toBe('Too many requests');
  });

  it('should accept custom message', () => {
    const err = new RateLimitError('Slow down, please');

    expect(err.message).toBe('Slow down, please');
  });

  it('should extend AppError and Error', () => {
    const err = new RateLimitError();

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toBeInstanceOf(RateLimitError);
  });
});

describe('Error hierarchy cross-checks', () => {
  it('should not confuse different error types via instanceof', () => {
    const notFound = new NotFoundError('X');
    const validation = new ValidationError('Y');
    const unauthorized = new UnauthorizedError();
    const forbidden = new ForbiddenError();
    const conflict = new ConflictError('Z');
    const rateLimit = new RateLimitError();

    expect(notFound).not.toBeInstanceOf(ValidationError);
    expect(validation).not.toBeInstanceOf(NotFoundError);
    expect(unauthorized).not.toBeInstanceOf(ForbiddenError);
    expect(forbidden).not.toBeInstanceOf(UnauthorizedError);
    expect(conflict).not.toBeInstanceOf(RateLimitError);
    expect(rateLimit).not.toBeInstanceOf(ConflictError);
  });

  it('should all be instanceof AppError', () => {
    const errors = [
      new NotFoundError('X'),
      new ValidationError('Y'),
      new UnauthorizedError(),
      new ForbiddenError(),
      new ConflictError('Z'),
      new RateLimitError(),
    ];

    for (const err of errors) {
      expect(err).toBeInstanceOf(AppError);
    }
  });

  it('should each have unique status codes', () => {
    const statusCodes = [
      new NotFoundError('X').statusCode,
      new ValidationError('Y').statusCode,
      new UnauthorizedError().statusCode,
      new ForbiddenError().statusCode,
      new ConflictError('Z').statusCode,
      new RateLimitError().statusCode,
    ];

    expect(new Set(statusCodes).size).toBe(statusCodes.length);
  });
});
