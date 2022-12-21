const db = require('../dbConfig');
const googleMapsClient = require('../../helpers/geocoder');

module.exports = {
    find,
    findById,
    findByBusiness,
    updateLocation
};

function find() {
    return db('locations')
}

function findById(id) {
    return db('locations')
        .where({ id })
        .select([ 'id', 'street_address', 'location_city', 'location_state', 'zip_code', 'formatted' ])
        .first()
}

function findByBusiness(business_id) {
    return db('locations')
        .where({ venue_id: business_id })
        .select(
            [
                'id',
                'street_address',
                'location_city',
                'location_state',
                'zip_code',
                'formatted'
            ]
        )
        .first()
}

async function updateLocation(location_id, location_update) {
    try {
        const geoCode = await googleMapsClient.geocode(
            {
                address: `${location_update.street_address}, ${location_update.location_city}, ${location_update.location_state} ${location_update.zip_code}`
            }
        ).asPromise();

        location = {
            street_address: `${geoCode.json.results[0].address_components[0].short_name} ${geoCode.json.results[0].address_components[1].long_name}`,
            location_city: geoCode.json.results[0].address_components[2].long_name,
            location_state: geoCode.json.results[0].address_components[4].short_name,
            zip_code: geoCode.json.results[0].address_components[6].short_name,
            formatted: geoCode.json.results[0].formatted_address,
            place_id: geoCode.json.results[0].place_id
        }

        await db('locations')
            .where({ id: location_id})
            .update(location, [ 'id' ])
        
        return await db('locations')
            .where({ id: location_id })
            .select(
                [
                    'id',
                    'street_address',
                    'location_city',
                    'location_state',
                    'zip_code',
                    'venue_name',
                    'formatted'
                ]
            )
            .first()
        // return await db('businesses')
        //     .where({ 'businesses.id': updated_business_location[0].venue_id })
        //     .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
        //     .select(
        //         [
        //             'businesses.id',
        //             'businesses.business_name',
        //             'businesses.business_avatar',
        //             'businesses.business_description',
        //             'businesses.business_type',
        //             'businesses.business_request_open',
        //             'businesses.active_business',
        //             'businesses.business_admin',
        //             'businesses.business_email',
        //             'businesses.business_phone',
        //             'businesses.business_instagram',
        //             'businesses.business_facebook',
        //             'businesses.business_website',
        //             'businesses.business_twitter',
        //             'locations.id as location_id',
        //             'locations.street_address',
        //             'locations.location_city',
        //             'locations.location_state',
        //             'locations.zip_code',
        //             'locations.formatted'
        //         ]
        //     )
        //     .first();
        
    } catch (error) {
        throw error
    }
}