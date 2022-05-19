const shortId = require('shortid')
const urlModel = require('../models/urlModel');
const redis = require('redis')
const {promisify} = require('util');
const { json } = require('body-parser');
const baseUrl = 'http://localhost:3000'


const isValid = function (value) {
  if (typeof value == 'undefined' || value === null) return false
  if (typeof value == 'string' && value.length === 0)
   return false
  return true
}

function validateUrl(value) {
  if (!(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(value.trim()))) {
      return false
  }
      return true
}

// const redis_config = {
//     host: 'redis-19368.c264.ap-south-1-1.ec2.cloud.redislabs.com',
//     port: 19368,
//     password: 'HtLBEmf7S0y27TkUnvlQYVgbFOs3ewfS'
// }
 
// const client = redis.createClient(redis_config);

// client.on('connect', async function(){
//     console.log("redis connection established")
// })

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

const set = promisify(redisClient.SET).bind(redisClient)
const get = promisify(redisClient.GET).bind(redisClient)


const createUrl = async (req,res)=>{
try{

    const  longUrl = req.body.longUrl
    
if(!longUrl)
    return res.status(400).send({status:false,message:"url is required"})

    if (!validateUrl(longUrl)) {
      return res.status(401).send({ status: false, msg: "longUrl is invalid" })
  }
    const isUrl = await urlModel.findOne({longUrl:longUrl})

    if(isUrl)
    return res.status(400).send({status:false,message:"short url is already created"})

    const urlCode = shortId.generate()
    const shortUrl = baseUrl+ '/' + urlCode

    const urlCreate = await urlModel.create({urlCode,longUrl,shortUrl})

    await set(`${longUrl}`,JSON.stringify(urlCreate))
    return res.status(201).send({status:true,message:"url has been shortened", longUrl:urlCreate}) 
}catch(error){
    return res.status(500).send({status:false,message:error.message})
}
}

// get url
const geturl = async (req,res)=>{
    try{
        let urlCode = req.params.urlCode

        const caching = await get(`${req.params.urlCode}`)
        const parsing = JSON.parse(caching)

        if(caching){
            return res.status(301).redirect(parsing.longUrl)
        }

      let  isUrl = await urlModel.findOne({urlCode:urlCode})

        if(!isUrl){
            return res.status(404).send({status:false, message:"Url not found"})
        }
        // const findingCode = await urlModel.findOne({ urlCode: urlCode }).select({longUrl:1, _id:0});
        // return res.status(201).send({status:true, data: findingCode})
const urldata = req.params.urlCode

await set(`$(urldata)`,JSON.stringify(isUrl))

return res.status(301).redirect(isUrl.longUrl)
         
     } catch (error) {
         return res.status(500).send({status:false, message:error.message})
         
     }
 
}

module.exports.createUrl = createUrl;
module.exports.geturl = geturl;