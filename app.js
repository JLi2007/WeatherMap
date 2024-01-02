const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '2mb' })); 
app.use(express.static('public')); 
app.listen(4900, () => console.log('WEATHER APP RUNNING'));


app.post('/api', async(req,res) => {
    console.log('server has received your request!')

    const {lat, lon, cityID, countryID} = req.body;

    if(
        (lat === undefined || lon === undefined) &&
        (cityID === undefined || cityID === "" || cityID === null)
    ){
        const errorResponse = {success: false, message: "you put nothing...", data:{invalidCityID: cityID}};
        return res.status(400).json(errorResponse);
    } 
    
    try{
        let url;
        const key = process.env.API_KEY;
        const cityValue = encodeURIComponent(cityID);
        if (countryID == "QS"){
            url = `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${key}&units=metric`;
        } else{
            url = `https://api.openweathermap.org/data/2.5/weather?q=${cityValue},${countryID}&appid=${key}&units=metric`;
        }
        const response = await axios.get(url);
        const weatherData = response.data;
        const successResponse = {success: true, message: "Server received your response ...", data:{weatherData}}
        return res.json(successResponse);
    }catch(error){
        const errorResponse = {success: false, message: "Enter a valid city"};
        return res.status(400).json(errorResponse);
    }
});


app.post('/location', async(req,res) => {
    console.log('received location request');
    try{
        let url;
        const {cityID, countryID} = req.body;
        const key = process.env.API_KEY;
        const cityValue = encodeURIComponent(cityID);
        if (countryID == "QS") {
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityValue}&limit=1&appid=${key}`
        }else{
            url = `http://api.openweathermap.org/geo/1.0/direct?q=${cityValue},${countryID}&limit=1&appid=${key}`
        }
        const response = await axios.get(url);
        const locationData = response.data;
        const successResponse = {success: true, message: "Server received your location response ...", data:{locationData}}
        return res.json(successResponse);
    }catch(error){
        const errorResponse = {success: false, message: "Location did not work..."};
        return res.status(400).json(errorResponse);
    }
})