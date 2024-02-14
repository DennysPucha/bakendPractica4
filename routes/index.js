var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/hola', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  //console.log(req);
  //console.log(res);
  console.log(next);
  res.send({"data":"hola"});
});


router.post('/hola', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  //console.log(req);
  //console.log(res);
  console.log(next);
  res.send({"data":"hola"});
});

module.exports = router;
