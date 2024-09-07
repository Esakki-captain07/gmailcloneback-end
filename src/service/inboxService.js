import express from 'express';
import Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import 'dotenv/config.js';
import userModel from '../model/userModel.js';
import emailModel from '../model/emailModel.js';

const fetchInbox = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        const user = await userModel.findById(userId).exec();

        if (!user) {
            console.log(`User not found for userId: ${userId}`);
            return res.status(404).send({ message: 'User not found' });
        }

        console.log(`User email: ${user.email}`);

        const imapConfig = {
            user: user.email,
            password: process.env.EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true
        };

        const imap = new Imap(imapConfig);

        function openInbox(cb) {
            imap.openBox('INBOX', false, cb);
        }

        imap.once('ready', function() {
            openInbox(async function(err, box) {
                if (err) {
                    console.error('Error opening inbox:', err);
                    return res.status(500).send({ message: 'Failed to open inbox' });
                }

                console.log('Inbox opened successfully');
                
                imap.search(['ALL'], async function(err, results) {
                    if (err) {
                        console.error('Error searching inbox:', err);
                        return res.status(500).send({ message: 'Failed to search inbox' });
                    }

                    console.log('Search results:', results);

                    if (results.length === 0) {
                        console.log('No emails found');
                        imap.end();
                        const emailsFromDB = await emailModel.find({ recipients: user.email }).exec();
                        return res.status(200).send({
                            message: 'No new emails found',
                            data: emailsFromDB
                        });
                    }

                    const emails = [];
                    const f = imap.fetch(results, { bodies: '' });

                    f.on('message', function(msg, seqno) {
                        msg.on('body', function(stream, info) {
                            simpleParser(stream, async (err, parsed) => {
                                if (err) {
                                    console.error('Parsing error:', err);
                                    return;
                                }

                                const { from, subject, text, date, messageId } = parsed;

                                try {
                                    const result = await emailModel.updateOne(
                                        { messageId }, 
                                        {
                                            $set: {
                                                subject,
                                                recipients: user.email,
                                                body: text,
                                                sender: from.text,
                                                date: date || Date.now(),
                                                draft: false,
                                                status: 'sent'
                                            }
                                        },
                                        { upsert: true } 
                                    );

                                    console.log(`Email upserted with messageId: ${messageId}`);

                                    if (result.upsertedCount > 0) {
                                        emails.push({
                                            subject,
                                            recipients: user.email,
                                            body: text,
                                            sender: from.text,
                                            date: date || Date.now(),
                                            draft: false,
                                            status: 'sent',
                                            messageId
                                        });
                                    }
                                } catch (saveError) {
                                    console.error('Error saving email to database:', saveError);
                                }
                            });
                        });
                    });

                    f.once('end', async function() {
                        imap.end();

                        const emailsFromDB = await emailModel.find({ recipients: user.email }).exec();
                        res.status(200).send({
                            message: 'Emails fetched and saved successfully',
                            data: emailsFromDB
                        });
                    });
                });
            });
        });

        imap.once('error', function(err) {
            console.error('IMAP Error:', err);
            res.status(500).send({ message: 'IMAP connection error', error: err });
        });

        imap.once('end', function() {
            console.log('IMAP connection ended.');
        });

        imap.connect();
    } catch (error) {
        console.error('Fetch Inbox Error:', error);
        res.status(500).send({ message: 'Internal Server Error', error });
    }
};

export default fetchInbox;
