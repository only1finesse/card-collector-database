const { db, DataTypes, Model } = require('../db'); 

class Card extends Model {}; 

Card.init({
    name: DataTypes.STRING, 
    imageUrl: DataTypes.STRING, 
    price: DataTypes.INTEGER
}, {
    sequelize: db
})

module.exports = { Card }