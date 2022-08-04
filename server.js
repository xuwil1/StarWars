if(process.env.NODE_ENV != 'production'){
  require('dotenv').config();
}

const express = require('express');
const bodyParser= require('body-parser')
const app = express();
const MongoClient = require('mongodb').MongoClient

app.use(bodyParser.urlencoded({ extended: true }))

app.listen(3000, function() {
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(bodyParser.json())

      MongoClient.connect(process.env.DATABASE_URL, 
      {useUnifiedTopology: true},(err, client) => {
        if (err) return console.error(err)
        console.log('Connected to Database')
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')

        app.post('/quotes', (req, res) => {
          quotesCollection.insertOne(req.body)
          .then(result => {
            res.redirect('/')
          }).catch(error => console.error(error))
        })

        app.get('/', (req, res) => {
          db.collection('quotes').find().toArray()
          .then(results => {
            res.render('index.ejs',{quotes: results })
          }).catch(error => console.error(error))
        })

        app.put('/quotes',(req,res)=>{
          quotesCollection.findOneAndUpdate(
            {name: 'Yoda'},
            {
              $set: {
                name: req.body.name,
                quote: req.body.quote
              }
            },
            {
              upsert: true
            }
          )
          .then(result => {
            res.json('Success')
           })
          .catch(error => console.error(error))
        })

        app.delete('/quotes',(req,res)=>{
          quotesCollection.deleteOne(
            { name: req.body.name }
          )
          .then(result => {
            if (result.deletedCount === 0) {
              return res.json('No quote to delete')
            }
            res.json(`Deleted Darth Vadar's quote`)})
          .catch(error => console.error(error))
        })
        
      })
    console.log('listening on 3000')
  })
