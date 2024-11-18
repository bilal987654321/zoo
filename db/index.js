const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'tmweNIOxBPMIx4m', {
  host: (process.env && process.env == 'local')? '127.0.0.1': 'dawn-surf-635.flycast',
  dialect: 'postgres'
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  profile: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
});

const Animal = sequelize.define('Animal', {
  animal_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  prenom: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  etat: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  visits: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

const Habitat = sequelize.define('Habitat', {
  habitat_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  commentaire_habitat: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

const Role = sequelize.define('Role', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

const Service = sequelize.define('Service', {
  service_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

const RapportVeterinaire = sequelize.define('RapportVeterinaire', {
  rapport_veterinaire_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  detail: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

const Race = sequelize.define('Race', {
  race_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  label: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
});

const Image = sequelize.define('Image', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  image_data: {
    type: DataTypes.BLOB,
    allowNull: false
  }
});

const Avis = sequelize.define('Avis', {
  avis_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pseudo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  commentaire: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
});

User.belongsToMany(Role, { 
  through: 'possede',
  foreignKey: 'userId',
  otherKey: 'roleId'
});
Role.belongsToMany(User, { 
  through: 'possede',
  foreignKey: 'roleId',
  otherKey: 'userId'
});

User.hasMany(RapportVeterinaire, {
  foreignKey: 'userId'
});
RapportVeterinaire.belongsTo(User, {
  foreignKey: 'userId'
});

Animal.hasMany(RapportVeterinaire, {
  foreignKey: 'animalId'
});
RapportVeterinaire.belongsTo(Animal, {
  foreignKey: 'animalId'
});

Animal.belongsTo(Race, {
  foreignKey: 'raceId'
});
Race.hasMany(Animal, {
  foreignKey: 'raceId'
});

Animal.belongsTo(Habitat, {
  foreignKey: 'habitatId'
});
Habitat.hasMany(Animal, {
  foreignKey: 'habitatId'
});

Animal.belongsToMany(Image, { 
  through: 'AnimalImages',
  foreignKey: 'animalId',
  otherKey: 'imageId'
});
Image.belongsToMany(Animal, { 
  through: 'AnimalImages',
  foreignKey: 'imageId',
  otherKey: 'animalId'
});

Habitat.belongsToMany(Image, { 
  through: 'comporte',
  foreignKey: 'habitatId',
  otherKey: 'imageId'
});
Image.belongsToMany(Habitat, { 
  through: 'comporte',
  foreignKey: 'imageId',
  otherKey: 'habitatId'
});

Service.belongsToMany(Image, { 
  through: 'utilise',
  foreignKey: 'serviceId',
  otherKey: 'imageId'
});
Image.belongsToMany(Service, { 
  through: 'utilise',
  foreignKey: 'imageId',
  otherKey: 'serviceId'
});


const models = {
  User,
  Role,
  Service,
  RapportVeterinaire,
  Animal,
  Race,
  Habitat,
  Image,
  Avis,
  sequelize,
  Sequelize
};

module.exports = models;