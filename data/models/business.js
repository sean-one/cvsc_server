const db = require('../dbConfig');
const googleMapsClient = require('../../helpers/geocoder');

module.exports = {
    find,
    findById,
    addBusiness,
    updateBusiness,
    toggleActiveBusiness,
    toggleBusinessRequest,
    findPending,
    remove
};

function find() {
    return db('businesses')
        // .where({ active_bus  iness: true })
        .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
        .leftJoin('users', 'businesses.business_admin', '=', 'users.id')
        .select(
            [
                'businesses.id',
                'businesses.business_name',
                'businesses.business_avatar',
                'businesses.business_description',
                'businesses.business_type',
                'businesses.business_request_open',
                'businesses.active_business',
                'businesses.business_admin',
                'users.username as admin_user',
                'businesses.business_email',
                'businesses.business_phone',
                'businesses.business_instagram',
                'businesses.business_facebook',
                'businesses.business_website',
                'businesses.business_twitter',
                'locations.id as location_id',
                'locations.street_address',
                'locations.location_city',
                'locations.location_state',
                'locations.zip_code',
                'locations.formatted'
            ]
        )
}

function findById(id) {
    return db('businesses')
        .where({ 'businesses.id': id })
        .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
        .select(
            [
                'businesses.id',
                'businesses.business_name',
                'businesses.business_avatar',
                'businesses.business_description',
                'businesses.business_type',
                'businesses.business_request_open',
                'businesses.active_business',
                'businesses.business_admin',
                'businesses.business_email',
                'businesses.business_phone',
                'businesses.business_instagram',
                'businesses.business_facebook',
                'businesses.business_website',
                'businesses.business_twitter',
                'locations.id as location_id',
                'locations.street_address',
                'locations.location_city',
                'locations.location_state',
                'locations.zip_code',
                'locations.formatted'
            ]
        )
        .first();
}

// used in postman to get pending request
function findPending() {
    return db('businesses')
        .where({ activeBusiness: false })
        .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
        .select(
            [
                'businesses.id',
                'businesses.business_name',
                'businesses.business_avatar',
                'businesses.business_description',
                'businesses.business_type',
                'businesses.business_request_open',
                'businesses.active_business',
                'businesses.business_admin',
                'businesses.business_email',
                'businesses.business_phone',
                'businesses.business_instagram',
                'businesses.business_facebook',
                'businesses.business_website',
                'businesses.business_twitter',
                'locations.id as location_id',
                'locations.street_address',
                'locations.location_city',
                'locations.location_state',
                'locations.zip_code',
                'locations.formatted'
            ]
        )
}

// creates new business & new admin role for the user requesting the new business
async function addBusiness(business) {
    try {
        const new_business = {
            business_avatar: business.business_avatar,
            business_description: business.business_description,
            business_name: business.business_name,
            business_type: business.business_type,
            business_email: business.business_email,
            business_admin: business.business_admin,
            // condidtionally add optional contact information
            ...(business.business_instagram && { business_instagram: business.business_instagram }),
            ...(business.business_phone && { business_phone: Number(business.business_phone) }),
            ...(business.business_twitter && { business_twitter: business.business_twitter }),
            ...(business.business_website && { business_website: business.business_website }),
            // REMOVE LATER
            active_business: true,
        }

        const business_location = {
            ...(business.street_address && { street_address: business.street_address }),
            ...(business.city && { location_city: business.city }),
            ...(business.state && { location_state: business.state }),
            ...(business.zip && { zip_code: business.zip }),
        }
        
        return await db.transaction(async trx => {
            
            // create new business
            const added_business = await db('businesses')
                .transacting(trx)
                .insert(new_business, ['id', 'business_name', 'business_admin', 'business_type'])
            
            // check for location
            if (added_business[0].business_type !== 'brand') {
                // google api with address returning geocode information
                const geoCode = await googleMapsClient.geocode(
                    {
                        address: `${business_location.street_address}, ${business_location.location_city}, ${business_location.location_state} ${business_location.zip_code}`
                    }
                ).asPromise();
                
                // save return from geocode and newly added business information
                location = {
                    venue_name: added_business[0].business_name,
                    venue_id: added_business[0].id,
                    street_address: `${geoCode.json.results[0].address_components[0].short_name} ${geoCode.json.results[0].address_components[1].long_name}`,
                    location_city: geoCode.json.results[0].address_components[2].long_name,
                    location_state: geoCode.json.results[0].address_components[4].short_name,
                    zip_code: geoCode.json.results[0].address_components[6].short_name,
                    formatted: geoCode.json.results[0].formatted_address,
                    place_id: geoCode.json.results[0].place_id
                }

                // insert location information
                await db('locations')
                    .transacting(trx)
                    .insert(location)
            }
            
            // create an business admin role for the user requesting the new business
            await db('roles')
                .transacting(trx)
                .insert({
                    user_id: added_business[0].business_admin,
                    business_id: added_business[0].id,
                    role_type: "admin",
                    // REMOVE AND UPDATE TO FALSE TO START
                    active_role: true,
                    approved_by: added_business[0].business_admin
                }, [ 'id' ])

            // return the newly created business with contact and location if created
            return db('businesses')
                .transacting(trx)
                .where({ 'businesses.id': added_business[0].id})
                .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
                .join('roles', 'businesses.id', '=', 'roles.business_id')
                .select(
                    [
                        'businesses.id',
                        'businesses.business_name',
                        'businesses.business_avatar',
                        'businesses.business_description',
                        'businesses.business_type',
                        'businesses.business_request_open',
                        'businesses.active_business',
                        'businesses.business_admin',
                        'businesses.business_email',
                        'businesses.business_phone',
                        'businesses.business_instagram',
                        'businesses.business_facebook',
                        'businesses.business_website',
                        'businesses.business_twitter',
                        'locations.id as location_id',
                        'locations.street_address',
                        'locations.location_city',
                        'locations.location_state',
                        'locations.zip_code',
                        'locations.formatted',
                        'roles.active_role',
                        'roles.role_type',
                    ]
                )
                .first()
        })
    } catch (error) {
        console.log(error)
        throw error
    }

}

async function updateBusiness(business_id, business) {
    try {
        await db('businesses')
            .where({ 'businesses.id': business_id})
            .update(business)
        
        return db('businesses')
            .where({ 'businesses.id': business_id})
            .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
            .select([
                'businesses.id',
                'businesses.business_name',
                'businesses.business_avatar',
                'businesses.business_description',
                'businesses.business_type',
                'businesses.business_request_open',
                'businesses.active_business',
                'businesses.business_admin',
                'businesses.business_email',
                'businesses.business_phone',
                'businesses.business_instagram',
                'businesses.business_facebook',
                'businesses.business_website',
                'businesses.business_twitter',
                'locations.id as location_id',
                'locations.street_address',
                'locations.location_city',
                'locations.location_state',
                'locations.zip_code',
                'locations.formatted'
            ])
            .first()
            
    } catch (error) {
        // console.log(error)
        throw error
    }
}

// toggle active business between true and false from business controls componenet
async function toggleActiveBusiness(business_id, admin_id) {
    const business = await db('businesses')
        .where({ 'businesses.id': business_id, 'businesses.business_admin': admin_id })
        .select(
            [
                'businesses.id',
                'businesses.active_business',
            ]
        )
        .first()

    await db('businesses')
            .where({ id: business.id })
            .update({ active_business: !business.active_business })
    
    return await db('businesses')
            .where({ 'businesses.id': business_id })
            .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
            .select([
                'businesses.id',
                'businesses.business_name',
                'businesses.business_avatar',
                'businesses.business_description',
                'businesses.business_type',
                'businesses.business_request_open',
                'businesses.active_business',
                'businesses.business_admin',
                'businesses.business_email',
                'businesses.business_phone',
                'businesses.business_instagram',
                'businesses.business_facebook',
                'businesses.business_website',
                'businesses.business_twitter',
                'locations.id as location_id',
                'locations.street_address',
                'locations.location_city',
                'locations.location_state',
                'locations.zip_code',
                'locations.formatted'
            ])
            .first()
}

async function toggleBusinessRequest(business_id, admin_id) {
    const business = await db('businesses')
        .where({ 'businesses.id': business_id, 'businesses.business_admin': admin_id })
        .select(
            [
                'businesses.id',
                'businesses.business_request_open'
            ]
        )
        .first()
    
    await db('businesses')
            .where({ id: business.id })
            .update({ business_request_open: !business.business_request_open })
    
    return await db('businesses')
            .where({ 'businesses.id': business_id })
            .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
            .select(
                [
                    'businesses.id',
                    'businesses.business_name',
                    'businesses.business_avatar',
                    'businesses.business_description',
                    'businesses.business_type',
                    'businesses.business_request_open',
                    'businesses.active_business',
                    'businesses.business_admin',
                    'businesses.business_email',
                    'businesses.business_phone',
                    'businesses.business_instagram',
                    'businesses.business_facebook',
                    'businesses.business_website',
                    'businesses.business_twitter',
                    'locations.id as location_id',
                    'locations.street_address',
                    'locations.location_city',
                    'locations.location_state',
                    'locations.zip_code',
                    'locations.formatted'
                ]
            )
            .first()
}

async function remove(business_id) {
    try {
        return await db.transaction(async trx => {
            
            // delete location for business to be deleted
            await db('locations')
                .transacting(trx)
                .where({ venue_id: business_id })
                .del()

            // delete all from roles
            await db('roles')
                .transacting(trx)
                .where({ business_id: business_id})
                .del()
            
            // delete all upcoming events with business
            await db('events')
                .transacting(trx)
                .where({ brand_id: business_id })
                .orWhere({ venue_id: business_id })
                .del()
            
            // delete from the businesses table
            return await db('businesses')
                .transacting(trx)
                .where({ id: business_id })
                .del()

            //! need to delete business avatar from s3 bucket
        })
    } catch (error) {
        throw error
    }
}