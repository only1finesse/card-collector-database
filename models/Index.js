const { Card } = require('./Card');
const { Collector } = require('./Collector');

Card.belongsTo(Collector); 
Collector.hasMany(Card); 

module.exports = { Card, Collector }