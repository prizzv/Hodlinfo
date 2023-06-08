const express = require('express');
const methodOverride = require('method-override')
const app = express();
const path = require('path');

const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { insertOrUpdateData, retrieveData} = require('./models/quadbtech.js');

app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))

app.set('view engine', 'ejs')

app.post('/storeToDatabase', async (req, res) => {
    await insertOrUpdateData("insert");
    
    res.send("Data stored to database successfully");
})

app.get('/', async (req, res, next) => {
    averageVals =[];

    try {
        var sum = 0;
        result = await retrieveData();

        for(let i in result.rows){
            sum += result.rows[i].last 
        }
        avg = sum / result.rows.length;
        averageVals.push(avg.toFixed(1));

        databaseData = result.rows;
        // console.log(databaseData.length);

        res.render('home.ejs', {databaseData, averageVals});
    } catch (error) {
        next(error);
    }

    // res.send("Loading please wait...");
})
app.get('/connect/telegram', (req, res) => {

    res.render('connect.ejs');
})

app.listen(5000, () => {
    console.log("LISTENING ON PORT 5000")
})


app.all('*', (req, res, next) => {
    
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Something went wrong'}  = err;
    res.status(statusCode).send(message);
    // res.send("Something went wrong :(");
})