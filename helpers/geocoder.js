const { Client } = require('@googlemaps/google-maps-services-js');

const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GEOCODER_API_KEY,
    Promise: Promise
});

const updatedGoogleMapsClient = new Client({})


module.exports = { googleMapsClient, updatedGoogleMapsClient };