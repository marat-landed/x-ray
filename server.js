const exec = require('child_process').exec;
var express = require("express");
var app     = express();
var path 	= require("path");
const fs = require('fs'); //Load the filesystem module

var child;
//Store all HTML files in view folder.
//Store all JS and CSS in Scripts folder.
// express.static(__dirname + '/folder where bootstrap is') no such file or directory
//app.use(express.static(path.join(__dirname, '/pages')));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/images'));
app.use(express.static(__dirname + '/execut'));

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

app.get('/exec',function(req,res){
  res.sendFile(path.join(__dirname+'/pages/exec.html'));
  //res.sendFile(path.resolve('pages/about.html'));
});

app.get('/matlab',function(req,res){
  res.sendFile(path.join(__dirname+'/pages/matlab.html'));
});

/*
200 OK, The request was successful
201 CREATED, A new resource object was successfully created
404 NOT FOUND, The requested resource could not be found
400 BAD REQUEST, The request was malformed or invalid
500 INTERNAL SERVER ERROR, Unknown server error has occurred
*/

app.get('/OK',function(req,res){
  var query = "Success!";
  res.status(200).send(query);
});

app.get('/Error',function(req,res){
  res.status(400).send('Current password does not match');
});

app.get('/json',function(req,res){
  //var query = req;
  console.log(req.query);
  res.status(200).send(req.query);
});

// Запрос изображений
app.get('/images-list',function(req,res){
  var images_list = req.query.list;
  // Полный путь к изображениям
  var images_path = path.join(__dirname+'/upload_pics/');
  // Создаем объект с полями: имя файла - размер файла - количество опросов
  var images_obj_list = [];
  images_list.forEach(function(item, i, images_list) {
    var img = {};
	img.name = item;
	img.size = 0;
	img.num = 0;
	images_obj_list.push(img);
  });
  // Запускаем цикл проверки наличия изображений в папке
  var timerId = setInterval(function(){
	// Получаем список файлов в заданной папке
	var files = fs.readdirSync(images_path);
	//files.forEach(function(item, i, files) {
	//  console.log(item);	
	//});	
	
	function checkFileExist(arr, val) {
	  return arr.some(function(arrVal) {
		return val === arrVal;
	  });
	}
	
	function checkFileRes(item) {
	  // item.name - имя искомого файла изображения	
	  // Проверяем, есть ли такое изображение в папке
	  var file_exist = checkFileExist(files, item.name); // true or false
	  if (file_exist) {
		// Определяем размер файла  
		const stats = fs.statSync(images_path+item.name);
		const fileSizeInBytes = stats.size;
		if (item.num == 0) {
		  item.size = fileSizeInBytes;
		  item.num++;
		} else {
		  if (item.size == fileSizeInBytes) {
			// Размер файла не увеличился, можно передавать
			return true;
			// Выходим из цикла
		  } else {
			// Размер файла увеличился, еще нельзя передавать
			item.size = fileSizeInBytes;
			return false;
		  }	
		}
	  }
	  
	}
	
	// Список файлов для отправки
	var file_res = images_obj_list.filter(checkFileRes);
	console.log(file_res);
	// Если список отправки не пустой, то завершаем цикл проверки папки и передаем изображение
	if (file_res.length > 0) {
	  clearTimeout(timerId);
	  // Считываем изображение
	  var filepath = images_path+file_res[0].name;
	  console.log(filepath);
	  
	  fs.readFile(filepath, function(err, data) {	
	    if (err) throw err; // Fail if the file can't be read.
		var base64data = new Buffer(data).toString('base64');
		// Заменяем содержимое
		var msg = {};
		msg.mimeType = 'image/jpeg';
		msg.filename = file_res[0].name;
		//msg.data = 'data:image/png;base64,' + base64data;
		msg.data = 'data:' + msg.mimeType + ';base64,' + base64data;
		var message = JSON.stringify(msg);
		// Передаем сообщение с изображением
		res.status(200).send(message);
      });  
	}
  },5000);
});

app.get('/execute',function(req,res){
	
  // EXEC - (execute) выполнять: const exec = require('child_process').exec;
  // Формируем команду в зависимости от полученных параметров
  //var command_str = path.resolve('/execut/hello');
  //var command_str = path.resolve('ls -a ./');	
  //var command_str = path.resolve('find . -type f | wc -l');	
  //var command_str = path.resolve('ls -a');
  //var command_str = path.resolve(__dirname + '/execut/hello');
  //var command_str = path.resolve('ls -a /');	
  var isWin = /^win/.test(process.platform);
  var os;
  var command_str;
  if (isWin) {
    command_str = path.resolve('execut/Fabrication.exe');  
	os = "Windows";
  } else {
    fs.chmodSync('./execut/hello', 0777);
    command_str = './execut/hello'; 
	os = "no-Windows";
  }    
  child = exec(command_str, function (error, stdout, stderr) {
    if (error) {
      console.log(error.stack);
      console.log('Error code: ' + error.code);
      console.log('Signal received: ' + error.signal);
      var mess_err = 'Error code: ' + error.code + ' Signal received: ' + error.signal;
      // console.log('exec error: ' + error);
      var mess = {annotation: 'OS: ' + os + '. Result of program execution (error)', message: mess_err};
      res.status(200).send(mess);
      return;
    }
    console.log(`Answer: ${stdout}`);
  });
  
  var output_report = '';
  child.stdout.on('data',function(chunk) {
	output_report += chunk.toString();	
	//console.log('stdout:',chunk);	
  });
	
  child.stderr.on('data', (data) => {
	console.error(`child stderr:\n${data}`);
  });

  child.on('close', (code) => {
	// Завершается последним (позже, чем child.on('exit'))
	console.log(`child process closed with code ${code}`);
	// Отсылаем отчет
	var mess = {annotation: 'OS: ' + os + '. Result of program execution', message: output_report};
	res.status(200).send(mess);
	console.log('mess = ',mess);
  });

  child.on('exit', function (code, signal) {
	// Завершается раньше, чем child.on('close')	
	// переменная signal имеет значение null, когда дочерний процесс завершается нормально
	console.log('child process exited with ' + `code ${code} and signal ${signal}`);
  });

  child.on('error', (err) => {
	console.log('Failed to start subprocess.',err);
  });
  
});

app.get('/matlab-proc',function(req,res){
  // EXEC - (execute) выполнять: const exec = require('child_process').exec;
  // Формируем команду в зависимости от полученных параметров
  var filename = 'matlablogo.jpg';
  // Полный путь к сохраненному файлу изображения
  var image_path = path.join(__dirname+'/upload_pics/'+filename);
  console.log(image_path);
  //var command_str = path.resolve('execut/Fabrication.exe');
  var command_str = path.resolve('execut/FM_CLC5.exe') + ' ACMO-BREN-CURV ' + image_path + ' 2 2 5 6';
  child = exec(command_str, function (error, stdout, stderr) {
	if (error) {
	  console.log(error.stack);
	  console.log('Error code: ' + error.code);
	  console.log('Signal received: ' + error.signal);
	  // console.log('exec error: ' + error);
	  return;
	}
	//console.log('stdout: ' + stdout);
	//console.log('stderr: ' + stderr);
	console.log('Программа завершена.');
  });
  
  // Собираем отчет в output_report
  var output_report = '';
  child.stdout.on('data',function(chunk) {
	output_report += chunk.toString();	
  });
	
  child.stderr.on('data', (data) => {
	console.error(`child stderr:\n${data}`);
  });

  child.on('close', (code) => {
	// Завершается последним (позже, чем child.on('exit'))
	console.log(`close: child process closed with code ${code}`);
	// Отсылаем отчет
	//var mess = {annotation: 'Result of program execution', message: output_report};
	var mess = {annotation: 0, message: "Выполнение программы завершено."};
	res.status(200).send(mess);
	//console.log('mess = ',mess);
  });

  child.on('exit', function (code, signal) {
	// Завершается раньше, чем child.on('close')	
	// переменная signal имеет значение null, когда дочерний процесс завершается нормально
	console.log('exit: child process exited with ' + `code ${code} and signal ${signal}`);
  });

  child.on('error', (err) => {
	console.log('Failed to start subprocess.',err);
  });
  
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