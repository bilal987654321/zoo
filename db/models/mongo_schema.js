const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnimalSchema = new Schema({
  id: { type: Number, required: true },
  visits: { type: Number, required: true },
});

const AnimalModel = mongoose.model('AnimalModel', AnimalSchema);

module.exports = AnimalModel;