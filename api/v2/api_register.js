const express = require("express")
const router = express.Router()
const  { fromBuffer } = require("file-type")
const fs = require("fs")
const {v4: uuidv4} = require("uuid")
const db = require("../../db")
const moment = require("moment")
var bcrypt = require("bcryptjs")



router.post("/register", async function(req, res){
     let myFileName = ""
     if(req.body.imageBase64 && req.body.imageBase64 != ""){

          myFileName = await base64ToImage(req.body.imageBase64)
          
     }

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


// ------ Upload Base 64 ------

async function base64ToImage(data){
     let fileExt = await(getExtImage(data))
     var myFileName = uuidv4() + "." + fileExt

     fs.writeFile("./uploaded/" + myFileName, data, 'base64', function(err){
          if(err){
               console.log(err)
               myFileName = ""
          }
     })

     return myFileName

}

async function getExtImage(data){
     const ext = await fromBuffer(Buffer.from(data, 'base64'))
     return ext.ext;
}



module.exports = router;