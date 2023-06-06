const express = require('express');
const methodOverride = require('method-override')
const app = express();


const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');


app.use(express.json())
app.use(methodOverride('_method'))



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