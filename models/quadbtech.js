const axios = require('axios');
const {pool} = require("../db")
const cron = require('node-cron');

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
cron.schedule('* * * * *', () => {
    insertOrUpdateData("update");
    console.log("Runing a task every minute");
});

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


module.exports = {insertOrUpdateData, retrieveData};