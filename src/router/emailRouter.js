import { Router } from "express";
import emailService from "../service/emailService.js";
import authMiddleware from "../midleware/authMidleware.js";
import fetchInbox from '../service/inboxService.js'
const routes = Router()

routes.post('/send',authMiddleware,emailService.sendEmail)
routes.get('/getAllEmail',authMiddleware,emailService.getAllMails)
routes.get('/getSendMail',authMiddleware,emailService.getSendEmail)
routes.get('/getMailById',authMiddleware,emailService.getMailById)
routes.post('/saveDraft',authMiddleware,emailService.saveDraft)
routes.get('/getDraftMails',authMiddleware,emailService.getDraftMails)
routes.put('/updateDraft/:id',authMiddleware,emailService.updateDraft)
routes.put('/moveToTrash/:id', authMiddleware, emailService.moveToTrash);
routes.get('/getTrashMails', authMiddleware, emailService.getTrashMails);
routes.delete('/emptyTrash/:id', authMiddleware, emailService.emptyTrash);

routes.put('/star/:id',authMiddleware,emailService.isStared)
routes.get('/staredMails',authMiddleware,emailService.getStaredMails)


routes.get('/inbox',authMiddleware,fetchInbox)


export default routes