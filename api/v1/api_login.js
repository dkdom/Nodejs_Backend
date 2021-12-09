const express = require("express")
const router = express.Router()
const expressSanitizer = require("express-sanitizer")
const db = require("../../db")
var bcrypt = require("bcryptjs")
const jwt = require("../../jwt")
const moment = require("moment")

var rateLimit = require("express-rate-limit")


// ------ Rate Limit ------

const appLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,   // 1 minute
    max: 2,
    message: "Too many requests, please try again later."
})


router.post("/login", appLimiter, function(req, res){
    // const email = req.sanitize(req.body.email)
    // res.send(email)

    // // ------ connect to database ------

    // db.query("SELECT * FROM tbl_customer", function(err, re){
    //     if(err) throw err

    //     console.log("Connect db sucess!!")

    //     res.send("Connect db sucess!!")
    // })

    // ------ Login by database ------
    const email = req.sanitize(req.body.email)
    const password = req.sanitize(req.body.password)

    let sql = "SELECT uuid, email, password FROM tbl_customer WHERE email = ? LIMIT 1"
    db.query(sql, [email], function(err, rs){
        if(err) throw err;

        if(rs.length >0){
            let isSuccess = bcrypt.compareSync(password, rs[0].password)

            if(isSuccess == true){

                var payload = {
                    uuid: rs[0].uuid,
                    email: email,
                    created_date: moment().format("YYY-MM-DD H:m:s")
                }

                const token = jwt.sign(payload)

                res.json({status: "success", message: "Login success", token: token})         
            }else{
                res.json({status: "error", message: "Email or password invalid"})
            }
        }else{
            res.json({status: "error", message: "Email or password invalid"})
        }
    })
})

module.exports = router;