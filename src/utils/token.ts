import jwt from 'jsonwebtoken';
import config from './config';

export const generateToken = (id: string) => {
    try {
        const token = jwt.sign({uuid: id}, config.SECRET_KEY, {expiresIn: "12d"});
        return token;
    } catch (error) {
        return null;
    }
}

export const isValidToken = (token: string) => {
    try {
        return jwt.verify(token, config.SECRET_KEY);
    } catch (error) {
        return null;
    }
}