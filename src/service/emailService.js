import emailModel from "../model/emailModel.js";
import {sendMail} from '../common/nodemailor.js'
import userModel from "../model/userModel.js";

const sendEmail = async (req, res) => {
    try {
        const { recipients, subject, body, attachments = [] } = req.body;
        const userId = req.userId;

        if (!subject && !body) {
            return res.status(400).send({ message: 'Subject or body is required' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const processedAttachments = attachments.map(att => {
            const buffer = Buffer.from(att.data.split(',')[1], 'base64');
            return {
                name: att.name,
                data: buffer
            };
        });

        const email = new emailModel({
            recipients,
            subject,
            body,
            attachments: processedAttachments,
            sender: userId,
            status: 'sent', 
            draft: false 
        });

        await sendMail({
            from: user.email,
            to: recipients,
            subject: subject,
            text: body,
            attachments: processedAttachments.map(att => ({
                filename: att.name,
                content: att.data
            }))
        });

        await email.save();
        console.log('Saved Email:', email);

        res.status(201).send({
            message: 'Email sent successfully',
            data: email
        });

    } catch (error) {
        console.log('Send Email Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};

const getAllMails = async (req, res) => {
    try {
        console.log("User ID:", req.userId); 
        const userId = req.userId; 
        console.log("User ID:", req.userId)
        const emails = await emailModel.find({ userId });

        res.status(200).send({
            message: 'Emails fetched successfully',
            data: emails
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};

const getSendEmail = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('User ID:', userId); 

        if (!userId) {
            return res.status(403).send({ message: 'User not authenticated' });
        }

        const sendMail = await emailModel.find({ sender: userId, status: 'sent' });
        console.log('Fetched Sent Emails:', sendMail);

        res.status(200).send({
            message: 'Sent emails retrieved successfully',
            data: sendMail
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};
const getMailById = async (req, res) => {
    try {
      const { id } = req.query 
        console.log('Received ID:', id);  
      if (!id) {
        return res.status(400).send({ message: 'Email ID is required' });
    }
    
    const email = await emailModel.findById(id);
    if (!email) {
        return res.status(404).send({ message: 'Email not found' });
    }
    
    res.status(200).send({ message: 'Email fetched successfully', data: email });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: error.message || 'Internal Server Error',
        error,
      });
    }
  };

  const saveDraft = async (req, res) => {
    try {
        const { recipients, subject, body, attachments = [] } = req.body;
        const userId = req.userId;

        if (!subject && !body) {
            return res.status(400).send({ message: 'Subject or body is required' });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const processedAttachments = attachments.map(att => {
            const buffer = Buffer.from(att.data.split(',')[1], 'base64');
            return {
                name: att.name,
                data: buffer
            };
        });

        const email = new emailModel({
            recipients,
            subject,
            body,
            attachments: processedAttachments,
            sender: userId,
            status: 'draft',
            draft: true 
        });

        await email.save();
        console.log('Saved Draft Email:', email);

        res.status(201).send({
            message: 'Draft saved successfully',
            data: email
        });

    } catch (error) {
        console.log('Save Draft Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};



const getDraftMails = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Querying drafts for user:', userId);

        const drafts = await emailModel.find({
            sender: userId,
            status: 'draft',
            draft: true
        });

        console.log('Draft Emails:', drafts); 

        if (drafts.length === 0) {
            return res.status(404).send({ message: 'No drafts found' });
        }

        res.status(200).send({
            message: 'Draft emails fetched successfully',
            data: drafts
        });
    } catch (error) {
        console.log('Get Draft Emails Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};

const updateDraft = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received ID:', id);

        const email = await emailModel.findById(id);
        if (!email) {
            return res.status(404).send({ message: 'Draft email not found' });
        }

        if (email.status !== 'draft') {
            return res.status(400).send({ message: 'Email is not a draft' });
        }

        const user = await userModel.findOne({ email: email.sender });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        await sendMail({
            from: user.email,
            to: email.recipients,
            subject: email.subject,
            text: email.body
        });

        email.status = 'sent';
        email.draft = false;
        await email.save();

        res.status(200).send({
            message: 'Draft email sent successfully',
            data: email
        });
    } catch (error) {
        console.log('Update Draft Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};

const moveToTrash = async (req, res) => {
    try {
        const { id } = req.params; 

        const updatedEmail = await emailModel.findByIdAndUpdate(
            id,
            { inTrash: true },
            { new: true } 
        );

        if (!updatedEmail) {
            return res.status(404).send({ message: 'Email not found' });
        }

        res.status(200).send({
            message: 'Email moved to trash successfully',
            data: updatedEmail
        });
    } catch (error) {
        console.log('Move to Trash Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};
const getTrashMails = async (req, res) => {
    try {
        const emails = await emailModel.find({ inTrash: true });
    
        if (!emails || emails.length === 0) {
          return res.status(404).json({ message: 'No starred emails found' });
        }
    
        res.json(emails);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching email details', error });
      }
};

const emptyTrash = async (req, res) => {
    try {
        const userId = req.userId;
        await emailModel.deleteMany({
            sender: userId,
            inTrash: true
        });

        res.status(200).send({
            message: 'Trash emptied successfully'
        });
    } catch (error) {
        console.log('Empty Trash Error:', error);
        res.status(500).send({
            message: error.message || 'Internal Server Error',
            error
        });
    }
};

const isStared = async (req, res) => {
    try {
        const { id } = req.params;
        const email = await emailModel.findById(id);
        if (!email) {
            return res.status(404).json({ success: false, message: 'Email not found' });
        }
        email.isStared = !email.isStared;
        await email.save();
        res.status(200).json({ success: true, isStared: email.isStared });
    } catch (error) {
        console.log('Toggle Star Error:', error);
        res.status(500).json({
            message: error.message || 'Internal Server Error',
            error
        });
    }
}
const getStaredMails = async (req, res) => {
  try {
    const emails = await emailModel.find({ isStared: true });

    if (!emails || emails.length === 0) {
      return res.status(404).json({ message: 'No starred emails found' });
    }

    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching email details', error });
  }
};




export default{
    sendEmail,
    getAllMails,
    getSendEmail,
    getMailById,
    getDraftMails,
    updateDraft,
    moveToTrash,
    getTrashMails,
    emptyTrash,
    isStared,
    getStaredMails,
    saveDraft
}