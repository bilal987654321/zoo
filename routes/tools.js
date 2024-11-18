var express = require('express');
var router = express.Router();
const db = require('../db/index');
const bcrypt = require('bcryptjs');

router.get('/seed', async function(req, res, next) {
  await db.sequelize.sync({ force: true });
  await seed();
});

async function seed() {
  try {     
    const users = await db.User.bulkCreate([
      { username: 'admin', password: '12345', nom: 'Bilal', prenom: 'Admin', profile: 'admin' },
      { username: 'doctor', password: '12345', nom: 'Doctor', prenom: 'Smith', profile: 'doctor' },
      { username: 'employee', password: '12345', nom: 'Mr.', prenom: 'Employe', profile: 'employee' }
    ]);

    const habitats = await db.Habitat.bulkCreate([
      { nom: 'Aquarium', description: 'Large saltwater tank', commentaire_habitat: 'Maintained weekly' },
      { nom: 'Terrarium', description: 'Enclosed reptile habitat', commentaire_habitat: 'Maintained daily' }
    ]);

    const races = await db.Race.bulkCreate([
      { label: 'Clownfish' },
      { label: 'Gecko' }
    ]);

    const animals = await db.Animal.bulkCreate([
      { prenom: 'Nemo', etat: 'Healthy', habitatId: habitats[0].habitat_id, raceId: races[0].race_id, visits:0 },
      { prenom: 'Leo', etat: 'Healthy', habitatId: habitats[1].habitat_id, raceId: races[1].race_id, visits:0 }
    ]);

    const roles = await db.Role.bulkCreate([
      { label: 'admin' },
      { label: 'employee' },
      { label: 'doctor' }
    ]);

    const services = await db.Service.bulkCreate([
      { nom: 'Veterinary Checkup', description: 'Routine health check' },
      { nom: 'Grooming', description: 'Animal grooming service' }
    ]);

    const reports = await db.RapportVeterinaire.bulkCreate([
      { date: new Date(), detail: 'Routine checkup', userId: users[0].id, animalId: animals[0].animal_id },
      { date: new Date(), detail: 'Grooming session', userId: users[1].id, animalId: animals[1].animal_id }
    ]);

    const images = await db.Image.bulkCreate([
      { image_data: Buffer.from('Image1') },
      { image_data: Buffer.from('Image2') }
    ]);

    await habitats[0].addImages(images[0]);
    await habitats[1].addImages(images[1]);

    await services[0].addImages(images[0]);
    await services[1].addImages(images[1]);

    const reviews = await db.Avis.bulkCreate([
      { pseudo: 'Reviewer1', commentaire: 'Great service!', isVisible: true },
      { pseudo: 'Reviewer2', commentaire: 'Very satisfied!', isVisible: true }
    ]);
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = router;
