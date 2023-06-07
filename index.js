const express = require('express');
const methodOverride = require('method-override')
const app = express();
const axios = require('axios');

const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');

let res_array = [];

const {pool} = require("./db")

async function insertData(name, last, buy, sell, volume, base_unit){

    // console.log(typeof(name), typeof(last), typeof(buy), typeof(sell), typeof(volume), typeof(base_unit));

    const res = await pool.query("INSERT INTO QuadBTech (name, last, buy, sell, volume, base_unit) VALUES ($1, $2, $3, $4, $5, $6)",
        [name, last, buy, sell, volume, base_unit]
    );

    console.log(res);
}
async function getOrUpdateData(todo){
    axios({
        method: 'get',
        url: 'https://api.wazirx.com/api/v2/tickers',
        responseType: 'json'
    }).then(async (response) => {
            let j = 0;
            for(let i in response.data) {
                if (j == 10){
                    break;
                }
                if(todo == "get"){
                await insertData(response.data[i].name, response.data[i].last,
                     response.data[i].buy, response.data[i].sell,
                      response.data[i].volume, response.data[i].base_unit);
                }else if(todo == "update"){
                    await updateData(response.data[i].name, response.data[i].last,
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

app.post('/storeToDatabase', async (req, res) => {
    await getOrUpdateData("get");

    res.send("Data stored to database successfully");
})

app.get('/', (req, res) => {

    res.render('home.ejs');
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