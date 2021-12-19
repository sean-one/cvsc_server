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
        // .where({ activeBusiness: true })
        .leftJoin('contacts', 'businesses.contact_id', '=', 'contacts.id')
        .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
        .select(
            [
                'businesses.id',
                'businesses.name',
                'businesses.avatar',
                'businesses.description',
                'businesses.businesstype',
                'businesses.requestOpen',
                'businesses.activeBusiness',
                'contacts.email',
                'contacts.instagram',
                'contacts.facebook',
                'contacts.website',
                'locations.formatted'
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
    try {
        return await db.transaction(async trx => {
            // create a new contact and get ID
            const newContact = await db('contacts')
                .transacting(trx)
                .insert(business.contact, ['id'])
        
            // add contact ID to business object
            business.business['contact_id'] = newContact[0].id
        
            // create new business
            const newBusiness = await db('businesses')
                .transacting(trx)
                .insert(business.business, ['id', 'name'])
        
            // check for location
            if (business.location) {
                const geoCode = await googleMapsClient.geocode({ address: `${business.location.street}, ${business.location.city}, ${business.location.state} ${business.location.zip}` }).asPromise();
                // console.log(geoCode)
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
                await db('locations')
                    .transacting(trx)
                    .insert(location)
                // console.log(geoCode.json.results[0])
            }

            return db('businesses')
                .transacting(trx)
                .where({ 'businesses.id': newBusiness[0].id})
                .leftJoin('contacts', 'businesses.contact_id', '=', 'contacts.id')
                .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
                .select(
                    [
                        'businesses.id',
                        'businesses.name',
                        'businesses.avatar',
                        'businesses.description',
                        'businesses.businesstype',
                        'businesses.requestOpen',
                        'businesses.activeBusiness',
                        'contacts.email',
                        'contacts.instagram',
                        'contacts.facebook',
                        'contacts.website',
                        'locations.formatted'
                    ]
                )
                .first()
        })
    } catch (error) {
        // console.log(error)
        throw error
    }

}