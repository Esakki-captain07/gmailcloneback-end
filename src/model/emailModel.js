import mongoose from './index.js'
import {randomString} from '../common/helper.js'

const emailSchema = new mongoose.Schema({
    messageId: { type: String,
        unique: true, 
        default: () => randomString(16) 
    },
    subject:{
        type:String
    },
    recipients:{ 
        type: String,
        required: true
    },
    body:{
        type:String,
        required:true
    },
    sender:{
        type:String
    },
    receiver:{
        type:String
    },
    date:{
        type: Date,
        default: Date.now
    },
    draft:{
        type:Boolean,
        default:false
    },
    status: { type: String,
        enum: ['sent', 'draft', 'failed'],
        default: 'draft'
    },
    isStared: { 
        type: Boolean, 
        default: false
    },
    attachments: [{
        name: String,
        data: Buffer
    }],
    inTrash: {
        type: Boolean,
        default: false 
    }

}, {
    collection: 'Email',
    versionKey: false
});

const emailModel = mongoose.model('email', emailSchema)

export default emailModel