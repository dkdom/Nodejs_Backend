const express = require("express")
const router = express.Router()
const fileType = require("file-type")
const {v4: uuidv4} = require("uuid")
const fs = require("fs")



router.post("/register", function(req, res){
     let myFileName = ""
     if(req.body.imageBase64 && req.body.imageBase64 != ""){

          myFileName = await base64ToImage(req.body.imageBase64)
          
     }
})


// ------ Upload Base 64 ------

async function base64ToImage(data){
     let fileExt = await(getExtImage(data))
     var myFileName = uuidv4() + "." + fileExt

     fs.writeFile(".'uploaded/" + myFileName, data, 'base64', function(err){
          if(err){
               console.log(err)
               myFileName = ""
          }
     })

     return myFileName

}

async function getExtImage(data){
     const ext = await fileType(Buffer.from(data, 'base64'))
     return ext.ext;
}



module.exports = router;