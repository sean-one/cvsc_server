const db = require('../dbConfig');
const googleMapsClient = require('../../helpers/geocoder');

module.exports = {
    find,
    findBusinessById,
    addBusiness,
    updateBusiness,
    toggleActiveBusiness,
    toggleBusinessRequest,
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

// .put('/business/update/:business_id)
function findBusinessById(business_id) {
    return db('businesses')
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
        .first();
}

// .post('/business/create) - creates a new business
async function addBusiness(business, location) {
    try {
        
        return await db.transaction(async trx => {

            // insert new business into database
            const added_business = await db('businesses')
                .transacting(trx)
                .insert(business, ['id', 'business_name', 'business_admin', 'business_type'])
            
            // check for location and save if submitted
            if (location !== undefined) {
                // google api with address returning geocode information
                const geoCode = await googleMapsClient.geocode(
                    {
                        address: `${location.street_address}, ${location.city}, ${location.state} ${location.zip}`
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
            
            // create a business_admin role for the user requesting the new business
            await db('roles')
                .transacting(trx)
                .insert({
                    user_id: added_business[0].business_admin,
                    business_id: added_business[0].id,
                    role_type: process.env.ADMIN_ACCOUNT,
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

// .put('/business/update/:business_id) - updates existing business
async function updateBusiness(business_id, changes, business_role) {
    try {
        return await db.transaction(async trx => {
            const { business_name } = await db('businesses').where({ id: business_id }).first()
            
            // if changes.location_id is not there then none of the following steps should be needed
            if(changes?.location_id && business_role === process.env.ADMIN_ACCOUNT) {
                console.log('inside first changes')
                // google api with address returning geocode information
                const geoCode = await googleMapsClient.geocode(
                    {
                        address: `${changes?.street_address}, ${changes?.city}, ${changes?.state} ${changes?.zip}`
                    }
                ).asPromise();

                // save return from geocode and newly added business information
                location = {
                    street_address: `${geoCode.json.results[0].address_components[0].short_name} ${geoCode.json.results[0].address_components[1].long_name}`,
                    location_city: geoCode.json.results[0].address_components[2].long_name,
                    location_state: geoCode.json.results[0].address_components[4].short_name,
                    zip_code: geoCode.json.results[0].address_components[6].short_name,
                    formatted: geoCode.json.results[0].formatted_address,
                    place_id: geoCode.json.results[0].place_id
                }

                if(changes.location_id === 'new_location') {
                    console.log('new location')
                    location['venue_id'] = business_id
                    location['venue_name'] = business_name
                    await db('locations').transacting(trx).insert(location)
                } else {
                    console.log('update location')
                    // insert location information
                    await db('locations').transacting(trx).where({ id: changes.location_id }).update(location)
                }
            }

            delete changes['street_address']
            delete changes['city']
            delete changes['state']
            delete changes['zip']
            delete changes['location_id']
            
            if(Object.keys(changes).length > 0) {
                await db('businesses').where({ id: business_id }).update(changes)
            }

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
        })  
    } catch (error) {
        // console.log(error)
        throw error
    }
}

// .put('/business/toggle-active/:business_id) - toggles 'active_business', all roles.active_roles toggle too
async function toggleActiveBusiness(business_id) {

    return await db.transaction(async trx => {
        // get current business object from the database to reference and toggle from, and confirm admin
        const business = await db('businesses')
            .where({ 'businesses.id': business_id })
            .select(
                [
                    'businesses.id',
                    'businesses.active_business',
                ]
            )
            .first()

        // change all roles that are not pending and update active role to match business
        await db('roles')
            .transacting(trx)
            .where({ business_id: business_id })
            .whereIn('roles.role_type', [process.env.CREATOR_ACCOUNT, process.env.MANAGER_ACCOUNT])
            .whereNotNull('roles.approved_by')
            .update({ active_role: !business.active_business })
        
        // update the active business status
        await db('businesses')
            .transacting(trx)
            .where({ id: business_id })
            .update({ active_business: !business.active_business })
        
        // return the new business object with updated active status
        return await db('businesses')
            .transacting(trx)
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
    })
}

// .put('/business/toggle-request/:business_id) - toggles 'business_request_open'
async function toggleBusinessRequest(business_id) {
    const business = await db('businesses')
        .where({ 'businesses.id': business_id })
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