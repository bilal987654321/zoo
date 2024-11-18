var express = require('express');
var router = express.Router();
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
  const nodemailer = require('nodemailer');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const base64Encode = (file) => {
    return Buffer.from(file).toString('base64');
};

router.post('/animals/',upload.array('images'), async (req, res) => {
    try {
        const animal = await Animal.create(
            { prenom: req.body.prenom, etat: req.body.etat, habitatId: req.body.habitat_id, raceId: req.body.race_id, visits: 0 },
        );

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const base64Image = base64Encode(file.buffer);
                const newImage = await Image.create({ image_data: base64Image });
                await animal.addImage(newImage);
            }
        }
        res.redirect('/admin');
    } catch (err) {
        console.error('Error adding new animal:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/animals/:id',upload.array('images'), async (req, res) => {
    try {
        await Animal.update({ prenom: req.body.prenom, etat: req.body.etat, habitatId: req.body.habitat_id, raceId: req.body.race_id }, { where: { animal_id: req.params.id } });
        const animal = await Animal.findByPk(req.params.id, {
            include: [Image]
        });
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const base64Image = base64Encode(file.buffer);
                const newImage = await Image.create({ image_data: base64Image });
                await animal.addImage(newImage);
            }
        }
        res.redirect('back');
        } catch (err) {
        console.error('Error updating animal:', err);  
        res.status(500).send('Server Error');
    }
});

router.get('/animals/:id/delete', async (req, res) => {
    try {
        await Animal.destroy({ where: { animal_id: req.params.id } });
        res.redirect('/admin');
    } catch (err) {
        console.error('Error deleting animal:', err);
        res.status(500).send('Server Error');
    }
});


router.post('/habitats/', async (req, res) => {
    try {
        await Habitat.create(
            { nom: req.body.nom, description: req.body.description, commentaire_habitat: req.body.commentaire_habitat },
        );
        res.redirect('/admin');
    } catch (err) {
        console.error('Error adding new habitat:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/habitats/:id', async (req, res) => {
    try {
        await Habitat.update(req.body, { where: { habitat_id: req.params.id } });
        res.redirect('/admin');
    } catch (err) {
        console.error('Error updating habitat:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/habitats/:id/delete', async (req, res) => {
    try {
        await Habitat.destroy({ where: { habitat_id: req.params.id } });
        res.redirect('/admin');
    } catch (err) {
        console.error('Error deleting habitat:', err);
        res.status(500).send('Server Error');
    }
});

router.delete('/images/:id/delete', async (req, res) => {
    try {
        
        await Image.destroy({ where: { image_id: req.params.id } });
        res.send(200);
        } catch (err) {
        console.error('Error deleting habitat:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/services/', upload.array('images'),async (req, res) => {
    try {
        const service = await Service.create(
            { nom: req.body.nom, description: req.body.description },
        );
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const base64Image = base64Encode(file.buffer);
                const newImage = await Image.create({ image_data: base64Image });
                await service.addImage(newImage);
            }
        }
        res.redirect('/admin');
    } catch (err) {
        console.error('Error adding new service:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/services/:id', upload.array('images'),async (req, res) => {
    try {
        await Service.update(req.body, { where: { service_id: req.params.id } });
        const service = await Service.findByPk(req.params.id, {
            include: [Image]
        });
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const base64Image = base64Encode(file.buffer);
                const newImage = await Image.create({ image_data: base64Image });
                await service.addImage(newImage);
            }
        }
        res.redirect('/admin');
    } catch (err) {
        console.error('Error updating service:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/services/:id/delete', async (req, res) => {
    try {
        await Service.destroy({ where: { service_id: req.params.id } });
        res.redirect('/admin');
    } catch (err) {
        console.error('Error deleting service:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/avis/:id/delete', async (req, res) => {
    try {
        const avi = await Avis.findByPk(req.params.id);
        if (avi) {
            await avi.destroy();
            res.redirect('/employee');
        } else {
            res.status(404).send('Avis not found');
        }
    } catch (err) {
        console.error('Error deleting Avis:', err);
        res.status(500).send('Server Error');
    }
});

const jwt = require('jsonwebtoken');

function getProfile(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    req.profile = 'guest';
    next();
  }

  jwt.verify(token, 'JWT_SECRET', (err, decoded) => {
      if (err) {
          return res.status(500).json({ message: 'Failed to authenticate token' });
      }

      req.profile = decoded.profile;
      next();
  });
}

router.post('/animals/:id/rapport', getProfile, async (req, res) => {
    const animalId = req.params.id;
    const { detail } = req.body;
    const userId = req.userId;

    if (req.profile !== 'doctor') {
        return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    try {
        const animal = await Animal.findByPk(animalId);
        if (!animal) {
            return res.status(404).json({ message: 'Animal not found' });
        }

        const rapport = await RapportVeterinaire.create({
            date: new Date(),
            detail,
            animalId,
            userId
        });

        res.redirect('/animals')
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating RapportVeterinaire', error: err });
    }
});


router.post('/send-email', async (req, res) => {
  const { email, comment } = req.body;

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'email@gmail.com',  
      pass: 'pass'  
    }
  });

  let mailOptions = {
    from: email,
    to: 'info@fake_zoo_1000000.com',
    subject: 'Contact Form Submission',
    text: `You have a new contact form submission from ${email}:\n\n${comment}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending email');
    }
    console.log('Message sent: %s', info.messageId);
    res.redirect('/');
  });
});

function isAdmin(req, res, next) {
    if (req.profile && req.profile === 'admin') {
        return next();
    } else {
        redirect('/')
        return res.status(403).send('Forbidden');
    }
}
router.post('/users/create', getProfile, isAdmin, async (req, res) => {
    const { username, email, nom, prenom, password, profile } = req.body;
    try {
        await User.create({ username, email, nom, prenom, password, profile });
        res.redirect('/admin');
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).send('Server Error');
    }
});

router.post('/avis/add', async (req, res) => {
    try {
        await Avis.create({
            pseudo: req.body.pseudo,
            commentaire: req.body.commentaire,
            isVisible: false,
        });
        res.redirect('/');
    } catch (err) {
        console.error('Error adding new Avis:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router