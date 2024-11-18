var express = require('express');
var router = express.Router();
const AnimalModel = require('../db/models/mongo_schema');

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
router.get('/admin', async (req, res) => {

  if(!req.user || req.user.profile != 'admin'){
    res.redirect('/');
  }

    try {
      const [
        animals,
        users,
        services,
        habitats,
        reports
      ] = await Promise.all([
        Animal.findAll({ 
          include: [Race, Habitat],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }),
        
        User.findAll({ limit: 5 }),
        Service.findAll({ limit: 10 }),
        Habitat.findAll({ limit: 10 }),
        RapportVeterinaire.findAll({ 
          include: [Animal],
          limit: 5,
          order: [['date', 'DESC']]
        })
      ]);

      // get stats from mongo
      for(var animal in animals){
        var foundAnimal = await AnimalModel.findOne({ id: req.params.id });
        animal.visits = foundAnimal? foundAnimal.visits: 0;
      }
      
      res.render('admin', {
        animals,
        users,
        services,
        habitats,
        reports,
        pageTitle: 'Dashboard'
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  });

  const jwt = require('jsonwebtoken');

  function getProfile(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        req.profile = 'guest';
        next();
    }
    else{

    jwt.verify(token, 'JWT_SECRET', (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }

        req.profile = decoded.profile;
        next();
    });
  }
}

router.get('/animals', getProfile, async (req, res) => {
  try {
    const hasHabitatId = req.query.habitat_id;
    const animals = await Animal.findAll({ 
      include: [
        { model: Race }, 
        { model: Habitat }, 
        { model: RapportVeterinaire, include: [User] }
      ], 
      where : hasHabitatId ? { habitatId: req.query.habitat_id } : {} 
    });
    res.render('animals', { animals, profile: req.profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching animals', error: err });
  }
});

router.get('/', async (req, res) => {
  try {
    const animals = await Animal.findAll({ 
      include: [
        { model: Race }, 
        { model: Image }, 
        { model: Habitat }, 
        { model: RapportVeterinaire, include: [User] } 
      ]}); 
    const services = await Service.findAll({include : [Image]});
    const avis = await Avis.findAll({where: {isVisible: true}});
    res.render('index', { services, animals, avis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching animals', error: err });
  }
});


router.get('/contact', async (req, res) => {
  try {
    res.render('contact');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching animals', error: err });
  }
});
router.get('/habitats', async (req, res) => {
  try {
      const habitats = await Habitat.findAll({
          include: [Animal]
      });
      res.render('habitats', { habitats });
  } catch (err) {
      console.error('Error loading habitats:', err);
      res.status(500).send('Server Error');
  }
});
router.get('/services', async (req, res) => {
  try {
    const services = await Service.findAll({include: Image});
    res.render('services', { services });
  } catch (err) {
      console.error('Error loading services:', err);
      res.status(500).send('Server Error');
  }
});
  router.get('/animals/:id/edit', async (req, res) => {
    try {
        var animal;
        if(req.params.id != 0){
            animal = await Animal.findByPk(req.params.id, {include: [Image]});
        }
        
        const races = await Race.findAll();
        const habitats = await Habitat.findAll();
        res.render('animal', { animal, races, habitats });
    } catch (err) {
        console.error('Error loading edit animal page:', err);
        res.status(500).send('Server Error');
    }
});

router.get('/animals/:id/images', async (req, res) => {
  try {
      const animal = await Animal.findByPk(req.params.id, {
          include: [Image]
      });
      res.json(animal.Images);
  } catch (err) {
      console.error('Error fetching animal images:', err);
      res.status(500).send('Server Error');
  }
});


router.get('/habitats/:id/edit', async (req, res) => {
  try {
    const habitat = await Habitat.findByPk(req.params.id);
    res.render('habitat', { habitat });
  } catch (err) {
      console.error('Error loading edit animal page:', err);
      res.status(500).send('Server Error');
  }
});


router.get('/services/:id/edit', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {include: [Image]});
    res.render('service', { service });
  } catch (err) {
      console.error('Error loading edit Service page:', err);
      res.status(500).send('Server Error');
  }
});

router.get('/employee', async (req, res) => {
  if(!req.user || req.user.profile != 'employee'){
    res.redirect('/');
  }
  try {
      const avis = await Avis.findAll({where: {isVisible: false}});
      res.render('employee', { avis });
  } catch (err) {
      console.error('Error loading employee dashboard:', err);
      res.status(500).send('Server Error');
  }
});

router.get('/avis/:id/accept', async (req, res) => {
  try {
      const avi = await Avis.findByPk(req.params.id);
      if (avi) {
          avi.isVisible = true;  
          await avi.save();
          res.redirect('/employee');
      } else {
          res.status(404).send('Avis not found');
      }
  } catch (err) {
      console.error('Error accepting Avis:', err);
      res.status(500).send('Server Error');
  }
});
function isAdmin(req, res, next) {
  if (req.profile && req.profile === 'admin') {
      return next();
  } else {
      return res.status(403).send('Forbidden');
  }
}

router.get('/users/create', getProfile, isAdmin, (req, res) => {
  console.log(req.profile);
  res.render('create_user', { pageTitle: 'Create User' });
});

router.get('/animals/:id', getProfile, async (req, res) => {
  try {
    const animal = await Animal.findByPk(req.params.id, {
      include: [
        { model: Race },
        { model: Habitat },
        { model: Image },
        { model: RapportVeterinaire, include: [User] }
      ]
    });

    if (!animal) {
      return res.status(404).send('Animal not found');
    }

    // update stats in mongo
    var foundAnimal = await AnimalModel.findOne({ id: req.params.id });
    if(!foundAnimal){
      foundAnimal = new AnimalModel({ id: req.params.id, visits: 0 });
    }
    foundAnimal.visits = foundAnimal.visits + 1;
    await foundAnimal.save();            

    res.render('view_animal', { animal });
  } catch (err) {
    console.error('Error fetching animal details:', err);
    res.status(500).send('Server Error');
  }
});


module.exports = router