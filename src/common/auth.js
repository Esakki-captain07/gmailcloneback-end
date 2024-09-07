import bcyrpt from 'bcrypt'
import 'dotenv/config.js'
import jwt from 'jsonwebtoken'

export const hashPassword = async(password)=>{
    try {
        let salt = await bcyrpt.genSalt(Number(process.env.SALT))
        let hashedPassword = await bcyrpt.hash(password,salt)
        return hashedPassword
        
    } catch (error) {
        throw error
    }
}

export const hashCompare = async(password,hashedPassword)=>{
    try {
        return await bcyrpt.compare(password,hashedPassword)
        
    } catch (error) {
        throw error
    }
}


export const createToken = async(payload)=>{
    try {
      return await jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'1h'})
        
    } catch (error) {
        throw error
    }
}

export const verifyToken = async(token)=>{
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        return decodedToken;
        
    } catch (error) {
        throw error
    }
}