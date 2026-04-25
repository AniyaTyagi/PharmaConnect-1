// Lightweight validation middleware — no external dependencies

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const validate = (rules) => (req, res, next) => {
  const errors = [];

  for (const [field, checks] of Object.entries(rules)) {
    const value = req.body[field];

    if (checks.required && (value === undefined || value === null || String(value).trim() === "")) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null || String(value).trim() === "") continue;

    if (checks.email && !isEmail(value)) errors.push(`${field} must be a valid email`);
    if (checks.minLength && String(value).length < checks.minLength) errors.push(`${field} must be at least ${checks.minLength} characters`);
    if (checks.isNumber && isNaN(Number(value))) errors.push(`${field} must be a number`);
    if (checks.min !== undefined && Number(value) < checks.min) errors.push(`${field} must be at least ${checks.min}`);
  }

  if (errors.length > 0) return res.status(400).json({ errors });
  next();
};

module.exports = validate;
