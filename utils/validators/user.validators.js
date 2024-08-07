const { z } = require("zod");

const userSignUpValidatorSchema = z.object({
  firstName: z.string().min(2).max(26),
  lastName: z.string().max(26).optional(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

const userSignInValidatorSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

module.exports = {
  userSignUpValidatorSchema,
  userSignInValidatorSchema,
};
