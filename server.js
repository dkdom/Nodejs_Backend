const express = require("express")
const app = express();
const cors = require("cors");
const { message } = require("statuses");
const expressSanitizer = require("express-sanitizer")
const path = require("path")

var corsOptions = {
    origin: "*",
    //origin: ["http//sayoudom.com", "http://dom.com"],
    optionSuccesStatus: 200
}

app.use(cors(corsOptions))

app.use("/image", express.static(path.join(__dirname, "./uploaded")))

app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({limit: '1mb', extended: true}))
app.use(expressSanitizer())

app.use(function(err, req, res, next){
    if(err.type == 'entity.too.large'){
        res.status(413).json({message: "Body size too large..."})
    }
})

app.use('/api/v1', require('./api/v1/api'))
app.use('/api/v2', require('./api/v2/api'))

const server = app.listen(3000, function(){
    var host = server.address().address;
    var port = server.address().port;

    console.log("Running on http://locohost", host, port)
})