import { ApiError } from '../utils/helpers.js';
export const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const err = new ApiError(400, 'Validation failed');
    err.errors = error.details.map(d => d.message);
    throw err;
  }
  req[source] = value;
  next();
};
