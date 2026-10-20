// validate(zodSchema) replaces req.body with the parsed (and coerced) value.
export default (schema) => (req, res, next) => {
  req.body = schema.parse(req.body);
  next();
};
