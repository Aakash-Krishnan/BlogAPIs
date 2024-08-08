const crypto = require("crypto");

const User = require("../models/user.model");

const {
  userSignUpValidatorSchema,
  userSignInValidatorSchema,
} = require("../../utils/validators/user.validators");

//* To get all the users
exports.getAllUsers = async (_, res) => {
  const users = await User.find({});
  const result = users.map((user) => {
    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  });
  return res.json({ users: result });
};

//* To handle user sign up.
exports.handleUserSignUp = async (req, res) => {
  const validatorResults = await userSignUpValidatorSchema.safeParseAsync(
    req.body
  );

  if (validatorResults.error)
    return res.status(400).json({ error: validatorResults.error });

  const { firstName, lastName, email, password } = validatorResults.data;

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");

  try {
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hash,
      salt,
    });

    return res.status(201).json({
      message: "User created successfully",
      data: { id: user._id, email: user.email },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }

    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//* To handle user sign in.
exports.handleUserSignIn = async (req, res) => {
  const validatorResults = await userSignInValidatorSchema.safeParseAsync(
    req.body
  );

  if (validatorResults.error)
    return res.status(400).json({ error: validatorResults.error });

  const { email, password } = validatorResults.data;

  const userEmail = await User.findOne({ email });

  if (!userEmail) return res.status(404).json({ error: "Email not found" });

  const hash = crypto
    .createHmac("sha256", userEmail.salt)
    .update(password)
    .digest("hex");

  if (hash !== userEmail.password)
    return res.status(400).json({ error: "Incorrect password" });

  return res.status(200).json({ message: "User signed in successfully" });
};
