const functions = require('firebase-functions');
const express = require('express');
const engines = require('consolidate');
const helmet = require('helmet')
const app = express();

app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

// function ignoreFavicon(req, res, next) {
//   if (req.originalUrl === '/favicon.ico') {
//     res.status(204).json({
//       nope: true
//     });
//   } else {
//     next();
//   }
// }

// app.use(ignoreFavicon);

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"]
  }
}))

app.get('/', (req, res) => {
  res.render('index.hbs')
});

exports.app = functions.https.onRequest(app);