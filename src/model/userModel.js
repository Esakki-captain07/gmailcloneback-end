import mongoose from './index.js';
import { validateEmail } from '../common/validate.js';

const userSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:[true,'userId is required']
    },
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: validateEmail,
            message: props => `${props.value} is not a valid email`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: Boolean,
        default: true
    },
}, {
    collection: 'user',
    versionKey: false
});

const userModel = mongoose.model('user', userSchema);

export default userModel;