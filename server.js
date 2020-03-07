const helmet = require('helmet');
const env = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');

env.config();

const port = process.env.PORT;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST;
const dbCollection = process.env.DB_COLLECTION;

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@${dbHost}/${dbCollection}?retryWrites=true&w=majority`, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find();
  const host = req.headers.host;

  res.render('index', { shortUrls, host });
});

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({
    full: req.body.fullUrl
  });

  res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });

  if (!shortUrl) {
    return res.sendStatus(404);
  }

  shortUrl.clicks++;

  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.listen(port, () => {
  console.log(`App conectado na porta ${port}!`);
});
