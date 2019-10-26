const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const parser = require('body-parser');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const request = require('request');
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);
const PORT = process.env.PORT || 8080;

app.use(parser.urlencoded({extended: false}));
app.use(express.static('public'));
app.use('/scripts', express.static('public/scripts'));

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

const Article = require('./models/articleModel.js');

app.get("/", function(req, res){
  request.get("https://www.nytimes.com", async function (error, response, html) {
    var $ = cheerio.load(html);
    $("article").each(function(i, element) {
      var articleTitle = $(element).find('a').text();
      var articleLink = $(element).find('a').attr('href');
      var insertedArticle = new Article({
        title : articleTitle,
        link: articleLink
       });
  
      insertedArticle.save(function(err, dbArticle) {
        if (err) {
          console.log(err);
        } else {
          console.log(dbArticle);
        }
      });
    });
    res.render('index');
  });
});


app.get('/displayInfo', function(req, res) {
  Article.find({}, function(err, articleData) {
    if(err) {
      throw err;
    }
    res.json(articleData);
  });
});

app.listen(PORT, function(req, res){
  console.log('You are listening on port ', PORT);
});