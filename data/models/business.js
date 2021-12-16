const db = require('../dbConfig');
const googleMapsClient = require('../../helpers/geocoder');

module.exports = {
    find,
    findById,
    findBrands,
    findVenues,
    addBusiness
};

function find() {
    return db('businesses')
        .select(
            [
                'id',
                'name',
                // 'email',
                'avatar',
                'description',
                'businesstype',
                'requestOpen',
                'activeBusiness'
            ]
        )
}

function findById(id) {
    return db('businesses')
        .where({ id })
        .first();
}

function findBrands() {
    return db('businesses')
        .whereNot({businesstype: 'venue'})
        .select(
            [
                'id',
                'name'
            ]
        )
}

function findVenues() {
    return db('businesses')
        .whereNot({ businesstype: 'brand' })
        .select(
            [
                'id',
                'name'
            ]
        )
}

async function addBusiness(business) {
    const newContact = await db('contacts').insert(business.contact, ['id'])

    business.business['contact_id'] = newContact[0].id

    const newBusiness = await db('business').insert(business.business, ['id', 'name'])

    if (business.location) {
        const geoCode = await googleMapsClient.geocode({ address: `${business.location.street}, ${business.location.city}, ${business.location.state} ${business.location.zip}` }).asPromise();
        location = {
            venue_name: newBusiness[0].name,
            venue_id: newBusiness[0].id,
            street: `${geoCode.json.results[0].address_components[0].short_name} ${geoCode.json.results[0].address_components[1].long_name}`,
            city: geoCode.json.results[0].address_components[2].long_name,
            state: geoCode.json.results[0].address_components[4].short_name,
            zipcode: geoCode.json.results[0].address_components[6].short_name,
            formatted: geoCode.json.results[0].formatted_address,
            place_id: geoCode.json.results[0].place_id
        }
        await db('location').insert(location)
        // console.log(geoCode.json.results[0])
    }

    return db('businesses')
        .where({ 'business.id': newBusiness[0].id})
        .select(
            [
                'id',
                'name',
                'email',
                'avatar',
                'description',
                'businesstype',
                'requestOpen',
                'activeBusiness'
            ]
        )
        .first()
}