
const mongoose = require("mongoose")

const createUrl = new mongoose.Schema ({
    
    urlCode: { 
    type: String,
    required:true, 
    unique:true,
     lowercase:true, 
     trim:true }, 
     longUrl: {
       type:String,
       required: true, 
       valid url}, 

       shortUrl: {
        type:String,
        required: true, 
        unique:true}
     }
    
    {timestamps:true}

    module.exports.createUrl = this.createUrl;