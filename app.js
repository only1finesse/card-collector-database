const express = require('express');
const { Card, Collector } = require('./models/Index');
const { sequelize } = require('./db');
const seed = require('./seed');
const Op = require('sequelize').Op;

const app = express();
const port = 3000;
app.use(express.json());

app.listen(port, async () => {
    await seed();
    console.log(`Server is listening on http://localhost:${port}`)
})

app.get('/', async (req, res) => {
    res.send('<h1>Welcome To The Card Collector App<h1/>')
})

// retrieve all cards in the database
app.get('/cards', async (req, res) => {
    const cards = await Card.findAll();
    res.send({cards})
})

// retrieve a specific card in the database ---> id
app.get('/cards/:id', async (req, res) => {
    const cards = await Card.findByPk(req.params.id)
    res.send({ cards })
})

// retrieve a specific card in the database ---> name wildcard
app.get('/cards/allcards/:searchname', async (req, res) => {
    searchname = req.params.searchname;
    const cards = await Card.findAll({
        where: {
            name: { [Op.like]: `%${searchname}%` }
        }
    });
    res.send({ cards })
})

// retrieve all collectors in the database
app.get('/collectors', async (req, res) => {
    const collectors = await Collector.findAll();
    res.send({ collectors })
})

// retrieve a collector ---> id
app.get('/collectors/:id', async (req, res) => {
    const collector = await Collector.findByPk(req.params.id);
    res.send({ collector })
})

// add a new card
app.post('/cards/', async (req, res) => {
    const newCard = await Card.create(req.body)
    res.send({ newCard })
})

// add a new collector
app.post('/collectors/', async (req, res) => {
    const newCollector = await Collector.create(req.body)
    res.send({ newCollector })
})

// delete a specific card in the database ---> id
app.delete('/cards/:id', async (req, res) => {
    const cards = await Card.destroy({
        where: { id: req.params.id }
    })
    res.send(`Card Deleted`)
})

// delete a specific user in the database ---> id
app.delete('/collectors/:id', async (req, res) => {
    const cards = await Collector.destroy({
        where: { id: req.params.id }
    })
    res.send(`Collector Deleted`)
})


const generateRandomIndex = () => {
    numArray = []; 
    nums = 5; 
    
    for (let i = 0; i < nums; i++) {
        newNum = Math.floor(Math.random()*21)
        if (!numArray.includes(newNum)){
            newNum = Math.floor(Math.random()*21)
        }
        numArray.push(newNum)
    }
    return numArray; 
}
// console.log(generateRandomIndex())

// generate 5 random cards for collector
app.put('/collectors/:collectorid/generate-pack', async(req, res) => {
    const collectorid = req.params.collectorid
    const cardIndexes = await generateRandomIndex()
    await cardIndexes.forEach(index => {
        Card.update({CollectorId: collectorid}, {
            where: {id: index}
        })
    });
    const collectorsPack = await Card.findAll({where: {
        CollectorId: collectorid
    }})
    res.send(collectorsPack)
})

// get collectors cards ---> id
app.get('/collectors/:collectorid/cards', async(req, res) => {
    collectorid = req.params.collectorid; 
    const collectorsCards = await Card.findAll({where: {
        CollectorId: collectorid
    }})
    res.send({collectorsCards})
})


