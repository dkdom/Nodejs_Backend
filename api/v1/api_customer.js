const express = require("express")
const router = express.Router()
const multer = require("multer")
const {v4: uuidv4} = require("uuid")
const path = require("path")
const db = require("../../db")
const jwt = require("../../jwt")
const moment = require("moment")
var bcrypt = require("bcryptjs")
var rateLimit = require("express-rate-limit")
const { RSA_PSS_SALTLEN_DIGEST } = require("constants")


// ------ Rate Limit ------

const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,   // 15 minute
    max: 3,
    message: "Too many requests, please try again later."
})


// ------ Select database ------

router.get("/customer/list",appLimiter, jwt.verify, function(req, res){

    //console.log(req.uuid)

    let sql = "SELECT uuid, customer_name, last_name, address, tel, email, image FROM tbl_customer ORDER BY created_date DESC"
    db.query(sql, function(err, rs){
        if(err) throw err;

        res.json(rs)
    })
})

// ------ Update database ------

router.post("/customer/update", jwt.verify, function(req, res){

    // ------ upload data ------

    let myFileName = ""
    const storage = multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, './uploaded')
        },
        filename: function(req, file, cb){
            myFileName = uuidv4() + path.extname(file.originalname)
            cb(null, myFileName)
        }
    })

    const upload = multer({storage: storage, limits: {fileSize: 2097152}}).single("myFile")
    upload(req, res, function(err){
        if(err instanceof multer.MulterError){
            if(err.code == "LIMIT_FILE_SIZE"){
                res.status(400).json({message: "File is large than 2mb"})
            }
        }else if(err){
            res.status(400).json({message: "Upload file is error"})
        }
        // res.json({message: "Upload is success"})


        // ------ create parametter ------
       const uuid = req.sanitize(req.body.uuid)
       const customer_name = req.sanitize(req.body.customer_name)
       const last_name = req.sanitize(req.body.last_name)
       const address = req.sanitize(req.body.address)
       const tel = req.sanitize(req.body.tel)
       const email = req.sanitize(req.body.email)
       const password = bcrypt.hashSync(req.body.password, 10)    //req.sanitize(req.body.password)
       const image = myFileName
       const created_date = moment().format("YYYY-MM-DD H:m:s")


       // ------ Update database ------

       let sql = "UPDATE tbl_customer SET ? WHERE uuid = ?"
       let values={
           "customer_name": customer_name,
           "last_name": last_name,
           "address": address,
           "tel": tel,
           "email": email,
           "password": password
       }

       let updateImage = {
           "image": image
       }

       if(myFileName != ""){
           values = {...values, ...updateImage}     // merge object
       }

       db.query(sql, [values, uuid], function(err, rs){
           if(err) throw err;

           res.json({status: "success", message: "Update success"})
       })
    })
})

// ------ Delete database ------

router.post("/customer/delete", jwt.verify, function(req, res){
    const uuid = req.sanitize(req.body.uuid)
    let sql = "DELETE FROM tbl_customer WHERE uuid = ?"
    db.query(sql, [uuid], function(err, rs){
        if(err) throw err

        res.json({status: "success", message: "Delete success"})
    })
})


// ------ select database by uuid ------

router.get("/customer/:uuid", jwt.verify, function(req, res){
    // "/customer/:uuid/:id"
    const uuid = req.sanitize(req.params.uuid)
    // const id = req.sanitize(req.params.id)

    let sql = `SELECT uuid, customer_name, last_name, address, tel, email, image 
                FROM tbl_customer WHERE uuid = ?`
    db.query(sql, [uuid], function(err, rs){
        if(err) throw err

        if(rs.length > 0){
            res.json(rs[0])
        }else{
            res.json({status: "error", message: "Not found"})
        }
    })
})


// ------ Promise ------

router.get("/customer/list/promise",appLimiter, jwt.verify, async function(req, res){

    let data = []
    data = await getData()

    let productItem = []
    productItem = await getDataProduct()
    
    res.json({
        customer: data,
        product: productItem
    })


})

function getData(){
    return new Promise((resolve, reject) => {
        let sql = "SELECT uuid, customer_name, last_name, address, tel, email, image FROM tbl_customer ORDER BY created_date DESC"
        db.query(sql, function(err, rs){
            if(err){
                reject("Error")
            }

            resolve(rs)
        })
    })
}

function getDataProduct(){
    return new Promise((resolve, reject) => {
        let sql = "SELECT uuid, customer_name, last_name, address, tel, email, image FROM tbl_customer ORDER BY created_date DESC"
        db.query(sql, function(err, rs){
            if(err){
                reject("Error")
            }

            resolve(rs)
        })
    })
}

module.exports = router;