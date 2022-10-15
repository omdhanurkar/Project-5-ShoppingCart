const express = require('express');
const route = require('./routes/route.js');
const  mongoose  = require('mongoose');
const app = express();
const multer = require("multer");


app.use(express.json());
app.use(multer().any());

mongoose.connect("mongodb+srv://Group48Database:zTjytU6VyO5vU2Zu@group48database.8dzrzxi.mongodb.net/Group48Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);

//----------handling wrong api edge case--------------------------------------------
app.use((req, res, next) => {
    res.status(400).send({ status: false, error: "Endpoint is not Correct" }); 
})


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});