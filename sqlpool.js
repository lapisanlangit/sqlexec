const mysql = require('mysql')
const tz = process.env.MYSQL_TIMEZONE || 'Asia/Jakarta'
const port = parseInt(process.env.MYSQL_PORT, 10) || 3306

const connectionString = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    port: port || '3306',
    database: process.env.MYSQL_DATABASE || 'test',
    timezone: tz
}

var pool = mysql.createPool(connectionString)
module.exports = pool