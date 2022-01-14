const express = require('express');
const { Card, Collector } = require('./models/Index');
const { sequelize } = require('./db');
const seed = require('./seed');
const Op = require('sequelize').Op;
const { count } = require('console');

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
    res.send({ cards })
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
app.post('/cards/addcard', async (req, res) => {
    const newCard = await Card.create(req.body)
    res.send({ newCard })
})

// add a new collector
app.post('/collectors/addcollector', async (req, res) => {
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

// generate 5 random indexes for cards id 
const generateRandomIndex = () => {
    const numArray = [];
    let numCount = 0;
    let newNum = Math.ceil(Math.random() * 21)
    while (numCount < 5) {
        if (numArray.includes(newNum)) {
            newNum = Math.ceil(Math.random() * 21)
        } else {
            numArray.push(newNum)
            numCount++
        }
    }
    return numArray;
}
console.log(generateRandomIndex())

// generate 5 random cards for collector
app.put('/collectors/:collectorid/generate-pack', async (req, res) => {
    const collectorid = req.params.collectorid
    let cardIndexes = await generateRandomIndex()
    let count = 0
    while (count < 5) {
        let idFromDb = await Card.findByPk(cardIndexes[count])
        if (idFromDb.CollectorId === null) {
            Card.update({ CollectorId: collectorid }, {
                where: { id: cardIndexes[count] }
            })
            count++
        } else {
            cardIndexes[count] = Math.ceil(Math.random() * 21) 
        }
    }
    const collectorsPack = await Card.findAll({
        where: {
            CollectorId: collectorid
        }
    })
    res.send(collectorsPack)
})

// get collectors cards ---> id
app.get('/collectors/:collectorid/cards', async (req, res) => {
    collectorid = req.params.collectorid;
    const collectorsCards = await Card.findAll({
        where: {
            CollectorId: collectorid
        }
    })
    res.send({ collectorsCards })
})

// buy card
app.put('/collectors/:collectorid/buycard/:cardid', async(req, res) => {
    const collectorid = req.params.collectorid; 
    const cardid = req.params.cardid; 
    const card = await Card.findByPk(cardid)
    const collector = await Collector.findByPk(collectorid)

    if((card.CollectorId === null) && (card.CollectorId !== collector.id) ) {
        if (collector.budget >= card.price) {
            await Collector.update({ budget: collector.budget - card.price }, {where: {
                id: collectorid
            }})
            await collector.addCard(card)
            res.send(`Card Purchased!`)
        } else {
            res.send(`Insufficent balance in your wallet`)
        }
    } else {
        res.send(`card not available in stock`)
    }
})

// sell card 
app.put('/collectors/:collectorid/sellcard/:cardid', async(req, res) => {
    const collectorid = req.params.collectorid; 
    const cardid = req.params.cardid; 
    const card = await Card.findByPk(cardid)
    const collector = await Collector.findByPk(collectorid)

    // console.log(card.CollectorId, collector.id)

    if (card.CollectorId === collector.id) {
        await Collector.update({ budget: collector.budget + card.price }, {where: {
            id: collectorid
        }})
        await Card.update({CollectorId: null}, {where: {
            id: cardid
        }})
        res.send(`Card Sold for $${card.price}`)
    } else {
        res.send(`this card is not yours to sell`)
    }
})

//trade card 
app.put('/collectors/trade/:traderid/:traderscard/:buyerid/:buyerscard', async(req, res) => {
    traderid = req.params.traderid
    buyerid = req.params.buyerid 
    traderscard = await Card.findByPk((req.params.traderscard))
    buyerscard = await Card.findByPk((req.params.buyerscard))
    trader = await Collector.findByPk(traderid)
    buyer = await Collector.findByPk(buyerid)

    // console.log(`${typeof(buyerscard.CollectorId)} --> ${typeof(buyerid)} : ${buyerscard.CollectorId === buyerid}`)

    // console.log(`${typeof(traderscard.CollectorId)} --> ${typeof(traderid)} : ${traderscard.CollectorId === traderid}`)

    if ((buyerscard.CollectorId === buyer.id) && (traderscard.CollectorId === trader.id)) {
        trader.addCard(buyerscard)
        buyer.addCard(traderscard)
        res.send(`Trade Succesful!`)
    } else {
        res.send('Trade Unsuccesful, check inventory')
    }
})

