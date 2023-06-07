const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    database: 'QuadBTechDb',
    password: 'Aniso9001!',
    port: 5432,
    host: 'localhost',
});

module.exports = {pool};