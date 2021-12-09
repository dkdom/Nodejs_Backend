const express = require("express")
const router = express.Router()
const multer = require("multer")
const {v4: uuidv4} = require("uuid")
const path = require("path")
const db = require("../../db")
const expressSanitizer = require("express-sanitizer")
const moment = require("moment")
var bcrypt = require("bcryptjs")


router.post("/register", function(req, res){
    // res.send("Hello register V2")

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
       const uuid = uuidv4()
       const customer_name = req.sanitize(req.body.customer_name)
       const last_name = req.sanitize(req.body.last_name)
       const address = req.sanitize(req.body.address)
       const tel = req.sanitize(req.body.tel)
       const email = req.sanitize(req.body.email)
       const password = bcrypt.hashSync(req.body.password, 10)    //req.sanitize(req.body.password)
       const image = myFileName
       const created_date = moment().format("YYYY-MM-DD H:m:s")


       // ------ insert into database ------

       let sql = "INSERT INTO tbl_customer(uuid, customer_name, last_name, address, tel, email, password, image, created_date) VALUES ?"
       let values=[[
           uuid,
           customer_name,
           last_name,
           address,
           tel,
           email,
           password,
           image,
           created_date
       ]]

       db.query(sql, [values], function(err, rs){
           if(err) throw err;

           res.json({status: "success", message: "Insert success"})
       })
    })
})

module.exports = router;