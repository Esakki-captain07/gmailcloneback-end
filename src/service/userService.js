import userModel from '../model/userModel.js'
import {hashPassword,createToken, hashCompare} from '../common/auth.js'
import {randomString} from '../common/helper.js'

const createUser = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(!user){
            req.body.password = await hashPassword(req.body.password)
            req.body.userId = randomString(8)
            await userModel.create(req.body)
            res.status(201).send({
                message:`User Created Successfull`
            })
        }else{
            res.status(403).send({
                message:`User Already Exsits this ${req.body.email}`
            })
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        })
    }
}

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const isPasswordValid = await hashCompare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid password' });
        }

        
        const payload = {
            _id:user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userId:user.userId
        };

       
        const token = await createToken(payload);

        res.status(200).send({
            message: 'User login successful',
            token
        });
    } catch (error) {
        console.log('Login Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};

export default{
    createUser,
    loginUser
}