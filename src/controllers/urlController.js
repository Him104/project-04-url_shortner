const shortId = require('shortid')
const urlModel = require('../models/urlModel');
const redis = require('redis')
const { json } = require('body-parser');
const {promisify} = require('util');



function validateUrl(value) {
  if (!(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(value.trim()))) {
      return false
  }
      return true
}

const redisClient = redis.createClient(
    18639,
    "redis-18639.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("0XHF40jfCCk9plgI7bgCt411B2HZFDf3", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });

  const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)

const isValid = (value) => {
  if (typeof value === 'undefined' || value === null) return false
  if (typeof value === 'string' && value.trim().length === 0) return false
  if (typeof value === 'number' && value.toString().trim().length === 0) return false
  return true;
}

const createUrl = async (req,res)=>{
try{

    const  longUrl = req.body.longUrl
    const baseUrl = 'http://localhost:3000'
    
if(!isValid(longUrl))
    return res.status(400).send({status:false,message:"url is required"})

    if (!validateUrl(longUrl)) {
      return res.status(401).send({ status: false, msg: "longUrl is invalid" })
  }
    const creatingShorturl = await urlModel.findOne({longUrl:longUrl})

    if(creatingShorturl)
    return res.status(201).send({status:true,message: "this url is already created", data: creatingShorturl})
    else
    {
      const urlCode = shortId.generate()
    const shortUrl = baseUrl+ '/' + urlCode

    // creating short url from db

    const creatingShorturl = await urlModel.create({urlCode,longUrl,shortUrl})
    
    // setting url in cache
    await SET_ASYNC(urlCode, longUrl);
    
      return res.status(201).send({status:true, message:"url has been shortened", longUrl:creatingShorturl}) 
    
    
    }
}catch(error){
    return res.status(500).send({status:false, message:error.message})
}
}

// get url
const geturl = async (req,res)=>{
    try{
        let urlCode = req.params.urlCode

        if(!isValid(urlCode))
    return res.status(400).send({status:false,message:"urlCode is required"})

        const caching = await GET_ASYNC(`${urlCode}`)

        if(caching){
          console.log("from redis")
            return res.status(301).redirect(caching);
        }

      let  findUrl = await urlModel.findOne({urlCode:urlCode})

        if(!findUrl){
            return res.status(404).send({status:false, message:"Url not found"})
        }
if(findUrl)

await SET_ASYNC(`$(req.params.urlCode)`,JSON.stringify(findUrl))
return res.status(301).redirect(findUrl.longUrl)


         
     } catch (error) {

     
         return res.status(500).send({status:false, message:error.message})
         
     }
 
}

module.exports.createUrl = createUrl;
module.exports.geturl = geturl;