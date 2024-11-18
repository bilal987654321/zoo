const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { 
    User, 
    Animal, 
    Habitat, 
    Race, 
    RapportVeterinaire, 
    Role, 
    Service, 
    Image, 
    Avis 
  } = require('../db/index');
const secretKey = 'JWT_SECRET';

router.get('/login', async (req, res) => {
    try {

        res.render('login');
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.create({ username, password: password });
        
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'email@gmail.com',  
              pass: 'pass'  
            }
          });
        
          let mailOptions = {
            from: email,
            to: username,
            subject: 'Account created '+username,
            text: `Contact admin for password`
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.status(500).send('Error sending email');
            }
            console.log('Message sent: %s', info.messageId);
            res.redirect('/');
          });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

router.get('/logout', async (req, res) => {
    const { username, password } = req.body;

    try {
        res.clearCookie("token");
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordIsValid = password == user.password;
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.id,  profile: user.profile }, secretKey, { expiresIn: 86400 });
        res.cookie('token', token, { httpOnly: true, secure: true });

        if(user.profile == 'admin'){
            
        res.redirect('/admin');
        }
        else if (user.profile =='doctor'){
            res.redirect('/');
        }
        else if (user.profile == 'employee'){
            res.redirect('/employee');
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error logging in', error: err });
    }
});

function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        req.profile = 'guest';
        next();
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        req.userId = decoded.id;
        next();
    });
}

router.get('/protected', verifyToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected route' });
});

module.exports = router;