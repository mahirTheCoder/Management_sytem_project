const authSchema = require("../model/authSchema");
const { isValidEmail } = require("../helpers/utils");



const registration = async (req, res) => {
  const { fullName, email, password } = req.body;


  try {
    if (!fullName?.trim())
      return res.status(400).send({ message: "FullName is required." });
    if (!email) return res.status(400).send({ message: "Email is required." });
    if (!isValidEmail(email))
      return res.status(400).send({ message: "Email is invalid." });
    if (!password)
      return res.status(400).send({ message: "Password is required." });

    const existEmail = await authSchema.findOne({ email });

    if (existEmail)
      return res.status(400).send({ message: "This email already registerd" });

    const user = await authSchema({ fullName, email, password });
    user.save();

    res
      .status(200)
      .send({ message: "Registration Successfully Please verify your email" });
  } catch (error) {
    console.log(error);

    res.status(500).send({ message: "Internal Server Error!" });
  }
};



// const login = (req, res) => {
//   const { username, password } = req.body;

//   try {
//  const userdata = authSchema.findOne({ email: username, password: password });

//  if (!userdata) {
//   return res.status(401).send({ message: "Invalid credentials" });
//  }

//     res.status(200).send({ message: "Login successful" });
//   } catch (error) {
//     res.status(500).send({ message: "Login failed" });
//   }
// };

module.exports = { registration, login };
