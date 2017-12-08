var express = require("express");
var app     = express();
var path = require("path");
//Store all HTML files in view folder.
//Store all JS and CSS in Scripts folder.
// express.static(__dirname + '/folder where bootstrap is') no such file or directory
//app.use(express.static(path.join(__dirname, '/pages')));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));

app.get('/',function(req,res){
  //res.sendFile(path.join(__dirname+'/pages/main.html'));
  //__dirname : It will resolve to your project folder.
  res.sendFile(path.resolve('pages/index.html'));
  //It will find and locate index.html from View or Scripts or pages
});

app.get('/home',function(req,res){
  //res.sendFile(path.join(__dirname+'/pages/main.html'));
  //__dirname : It will resolve to your project folder.
  res.sendFile(path.resolve('pages/main.html'));
  //It will find and locate index.html from View or Scripts or pages
});

app.get('/about',function(req,res){
  res.sendFile(path.join(__dirname+'/pages/about.html'));
  //res.sendFile(path.resolve('pages/about.html'));
});

app.get('/instruments',function(req,res){
  res.sendFile(path.join(__dirname+'/pages/instruments.html'));
});

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 3000, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;