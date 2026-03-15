const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = error.errors.map((err) => ({
        field: err.path.join("-"),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation Error!',
        errors: formattedError
      })
    }

    next(error)
  }
};

module.exports = validate
