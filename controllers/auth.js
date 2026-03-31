const authSchema = require("../model/authSchema");



const register = async (req, res) => {
  const { fullname, email, password, phone } = req.body;

  try {
    const user = await authSchema({
      fullname,
      email,
      password,
      phone,
    });
    await user.save();

    res.status(200).send({ message: "Registration successful" });
  } catch (error) {
    res.status(500).send({ message: "Registration failed" });
  }
};





const login = (req, res) => {
  const { username, password } = req.body;

  try {
 const userdata = authSchema.findOne({ email: username, password: password });

 if (!userdata) {
  return res.status(401).send({ message: "Invalid credentials" });
 }

    res.status(200).send({ message: "Login successful" });
  } catch (error) {
    res.status(500).send({ message: "Login failed" });
  }
};

module.exports = { register, login };
