const express = require("express")
const router = express.Router()

router.post("/login", function(req, res){
    res.send("Hello login V2")
})

module.exports = router;