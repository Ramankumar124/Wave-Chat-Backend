
import jwt from 'jsonwebtoken';


interface User {
  email: string;
  _id: string;
}
const generateToken = (user: User): string => {
  return jwt.sign({ email: user.email, id: user._id }, process.env.JWT_KEY as string, { expiresIn: '1h' });
};
export { generateToken };
