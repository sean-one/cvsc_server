const googleMapsClient = require('@google/maps').createClient({
    key: process.env.GEOCODER_API_KEY,
    Promise: Promise
});

module.exports = googleMapsClient;