const path = require('path');
const fs = require('fs').promises;
const {db} = require('./db');
const { Card, Collector } = require('./models/Index');

const seed = async () => {
    await db.sync({ force: true });

    const cardSeedPath = path.join(__dirname, 'cards.json');
    const collectorSeedPath = path.join(__dirname, 'collectors.json');

    const cardsBuffer = await fs.readFile(cardSeedPath);
    const collectorsBuffer = await fs.readFile(collectorSeedPath);

    const { carddata } = JSON.parse(String(cardsBuffer));
    const { collectordata } = JSON.parse(String(collectorsBuffer));

    const cardPromises = carddata.map(card => Card.create(card));
    const collectorPromises = collectordata.map(collector => Collector.create(collector));

    await Promise.all(cardPromises)
    await Promise.all(collectorPromises)

    console.log('Cards have been populated into the database')
    console.log('Collectors have been populated into the database')
}

// seed()

module.exports = seed; 