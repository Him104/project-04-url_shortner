const shortId = require('shortid')
const urlModel = require('../models/urlModel');



const createUrl = async (req,res)=>{
try{
    const  longUrl = req.body.longUrl
    const baseUrl = 'http://localhost:3000'

if(!longUrl)
    return res.status(400).send({status:false,message:"url is required"})

    const isUrl = await urlModel.findOne({longUrl:longUrl})

    if(isUrl)
    return res.status(400).send({status:false,message:"short url is already created"})

    const urlCode = shortId.generate()
    const shortUrl = baseUrl+ '/' + urlCode

    const urlCreate = await urlModel.create({urlCode,longUrl,shortUrl})

    return res.status(201).send({status:false,message:"url has been shortened",data:urlCreate}) 
}catch(error){
    return res.status(500).send({status:false,message:error.message})
}
}

// get url
const geturl = async (req,res)=>{
    try{
        let urlCode = req.params.urlCode

      let  isUrl = await urlModel.findOne({urlCode:urlCode})

    

        if(!isUrl){
            return res.status(404).send({status:false, message:"Url not found"})
        }
        const data = await urlModel.findOne({ urlCode: urlCode }).select({longUrl:1, _id:0});
        return res.status(201).send({status:true, data:data})

         
     } catch (error) {
         return res.status(500).send({status:false, message:error.message})
         
     }
 
}

module.exports.createUrl = createUrl;
module.exports.geturl = geturl;