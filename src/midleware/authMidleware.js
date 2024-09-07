import { verifyToken } from '../common/auth.js';

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(403).send({ message: 'No token provided' });
        }

        const decodedToken = await verifyToken(token);
        req.userId = decodedToken._id; 
        next();
    } catch (error) {
        return res.status(401).send({ message: 'Invalid token' });
    }
};

export default authMiddleware;
