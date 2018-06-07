import express from 'express';
import passport from 'passport';
import Store from '../models/store';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import guard from 'connect-ensure-login';
import { check, validationResult } from 'express-validator/check';

const router = express.Router();

router.get('/dashboard', guard.ensureLoggedIn(), (req, res) => {
  res.render('superadmin/dashboard', { layout: 'layouts/user' });
});


export default router;
