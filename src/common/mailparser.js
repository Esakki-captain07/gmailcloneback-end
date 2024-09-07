import express from 'express'
import Imap from 'node-imap'
import {simpleParser} from 'mailparser'
import 'dotenv/config.js'

const imapConfig = {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  };

export default imapConfig