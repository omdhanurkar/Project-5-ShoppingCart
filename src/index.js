const express = require('express');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


mongoose.connect("mongodb+srv://Group48Database:zTjytU6VyO5vU2Zu@group48database.8dzrzxi.mongodb.net/test", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))

app.use('/', route); 

app.use((req, res) => {
    return res.status(400).send({ status: false, message: "End point is incorrect" })
});

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});
