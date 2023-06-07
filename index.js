const express = require('express');
const methodOverride = require('method-override')
const app = express();
const axios = require('axios');
const path = require('path');

const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');


const {pool} = require("./db")

async function insertData(name, last, buy, sell, volume, base_unit){

    // console.log(typeof(name), typeof(last), typeof(buy), typeof(sell), typeof(volume), typeof(base_unit));
    
    try {
        const res = await pool.query("INSERT INTO quadbtech (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)",
            [name, last, buy, sell, volume, base_unit]
        );
        // console.log(`Inserted data into quadbtech table`);
    } catch (error) {
        console.error(error);
    }

    // console.log(res);
}
async function retrieveData(){
    let res;
    try {
         res = await pool.query("SELECT * FROM quadbtech");
        // console.log(res.rows);
    } catch (error) {
        console.error(error);
    }

    return res;
}
async function updateData(id, name, last, buy, sell, volume, base_unit) {
    
    try {
        const res = await pool.query("UPDATE quadbtech SET name = $1, last = $2, buy = $3, sell = $4, volume=$5, base_unit=$6 WHERE id = $7",
            [name, last, buy, sell, volume, base_unit, id]
        );

        // console.log(`Updated the quadbtech table with the id: ${id}`);
    } catch (error) {
        console.error(error);
    }
}

// gets the data from the api and stores it in the database
async function insertOrUpdateData(operationMethod){
    axios({
        method: 'get',
        url: 'https://api.wazirx.com/api/v2/tickers',
        responseType: 'json'
    }).then(async (response) => {
            let j = 2;
            for(let i in response.data) {
                if (j == 12){
                    break;
                }
                if(operationMethod == "insert"){
                    await insertData(response.data[i].name, response.data[i].last,
                        response.data[i].buy, response.data[i].sell,
                        response.data[i].volume, response.data[i].base_unit);
                }else if(operationMethod == "update"){
                    await updateData(j, response.data[i].name, response.data[i].last,
                        response.data[i].buy, response.data[i].sell,
                        response.data[i].volume, response.data[i].base_unit);
                }

                // res_array.push(response.data[i].name);
                j++;
            }
    });
}

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