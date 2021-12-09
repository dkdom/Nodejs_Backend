var mysql = require("mysql")

var connection = mysql.createPool({
    connectionLimit: 1000,
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: "node_workshop_db"
})

module.exports = connection