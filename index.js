var express = require('express');
var nodemailer = require('nodemailer');
var bodyParser = require('body-parser');
var path = require('path');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var cron = require('cron');
var moment = require('moment');
var port = process.env.PORT || 8000;

var app = express();
app.locals.moment = require('moment');
var url = "mongodb://maildata:maildata1@ds015335.mlab.com:15335/nodem";

app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.Promise = global.Promise;
mongoose.connect( url, { useNewUrlParser: true });


var mailSchema = new mongoose.Schema({
    tomail: {type: String},
    cc: {type: String},
    bcc: {type: String},
    tsubject: {type: String},
    date: { type: Date, default: Date.now },
    scheduledate: { type: Date },
    message: { type: String }
});

var maildata = mongoose.model("maildata", mailSchema);

app.get('/', function(req, res){
    
    res.render('index',{title: 'Exambazaar'});
});

app.get('/about', function(req, res){
    res.render('about');
});

app.get('/contact', function(req, res){
    res.render('contact');
});
app.get('/report', function(req, res){
    console.log("Print 2");


    maildata.find({}, function(err, docs){
		if(err) res.json(err);
        else    res.render('report', {maildatas: docs});
    
    });
   

});
/* app.get('*', function(req, res){
    console.log("Print 1");
    res.send(null);

    maildata.find({}, function(err, docs){
		if(err) res.json(err);
        else    res.render('report', {maildatas: docs});
    res.render('report');
    console.log('date found'); 
    });
    

}); */



/* app.post('/report', function(req, res){
	new maildata({
		_id    : req.body.toemail,
		tomail: req.body.tomail,
        cc   : req.body.cc,
        bcc : req.body.bcc,
        tsubject : req.body.tsubject,
        date : req.body.date,
        message	: req.body.message,
        scheduledate : req.body.scheduledate,
        scheduletime : req.body.scheduletime
	}).save(function(err, doc){
		if(err) res.json(err);
		else    res.redirect('/report');
	});
}); */
app.post('/contact/send', function(req, res){ 
    //send email using nodemailer
    var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'testcomeb@gmail.com',
        pass: 'testcom231834'   //enter the password associated with user mail in signle inverted commas 
        }
    });

    var toemail = req.body.tomail;
    var cc = req.body.cc;
    var bcc = req.body.bcc;

    var mailOptions = {
        from: 'testcom <testcomeb@gmail.com>',
        to: toemail+","+cc+","+bcc,
        subject: req.body.tsubject,
        html: '<div>'+req.body.message+'</div>'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.send(null);
        }
        else{
            console.log('Message Sent: '+info.response);
            
            //save email into db
            var myData = new maildata(req.body);

            console.log(myData);

            myData.save()
            .then(item => {
            res.redirect('/');
            })
            .catch(err => {
            res.status(400).send("unable to save to database");
            });

        }
    });
    
    
	
	// var CronJob = require('cron').CronJob;
    // new CronJob('*/30 * * * *', function(err, res) {
    // console.log('You will see this message in every 30 minute');
    // }, null, true, 'America/Los_Angeles')

    
});




app.listen(port, function(){
    console.log("App is running on port "+port);
});