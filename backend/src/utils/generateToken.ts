import jwt from 'jsonwebtoken';

const generateToken = (id: string, isGhost: boolean) => {
  return jwt.sign({ id, isGhost }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export default generateToken;
