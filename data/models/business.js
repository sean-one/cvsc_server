const db = require('../dbConfig');
const googleMapsClient = require('../../helpers/geocoder');

module.exports = {
    find,
    findById,
    addBusiness,
    updateBusiness,
    findPending,
    remove
};

function find() {
    return db('businesses')
        .where({ activeBusiness: true })
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
                'businesses.business_admin',
                'businesses.email',
                'businesses.phone',
                'businesses.instagram',
                'businesses.facebook',
                'businesses.website',
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
                'businesses.name',
                'businesses.avatar',
                'businesses.description',
                'businesses.businesstype',
                'businesses.requestOpen',
                'businesses.activeBusiness',
                'businesses.business_admin',
                'businesses.email',
                'businesses.phone',
                'businesses.instagram',
                'businesses.facebook',
                'businesses.website',
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
                'businesses.name',
                'businesses.avatar',
                'businesses.description',
                'businesses.businesstype',
                'businesses.requestOpen',
                'businesses.activeBusiness',
                'businesses.business_admin',
                'businesses.email',
                'businesses.phone',
                'businesses.instagram',
                'businesses.facebook',
                'businesses.website',
                'locations.formatted'
            ]
        )
}

// creates new business & new admin role for the user requesting the new business
async function addBusiness(business) {
    try {
        const new_business = {
            avatar: business.business_avatar,
            description: business.business_description,
            name: business.business_name,
            businesstype: business.business_type,
            email: business.email,
            instagram: business.instagram,
            phone: Number(business.phone),
            twitter: business.twitter,
            website: business.website,
            business_admin: business.business_admin,
            // REMOVE LATER
            activeBusiness: true,
        }

        if (new_business.businesstype !== 'brand') {
            const business_location = {
                street: business.street,
                city: business.city,
                state: business.state,
                zipcode: business.zip,
            }
        }
        
        return await db.transaction(async trx => {
            
            // create new business
            const added_business = await db('businesses')
            .transacting(trx)
            .insert(new_business, ['id', 'name', 'business_admin', 'businesstype'])
            
            // check for location
            if (added_business[0].businesstype !== 'brand') {
                // google api with address returning geocode information
                const geoCode = await googleMapsClient.geocode({ address: `${business_location.street}, ${business_location.city}, ${business_location.state} ${business_location.zip}` }).asPromise();
                
                // save return from geocode and newly added business information
                location = {
                    venue_name: added_business[0].name,
                    venue_id: added_business[0].id,
                    street: `${geoCode.json.results[0].address_components[0].short_name} ${geoCode.json.results[0].address_components[1].long_name}`,
                    city: geoCode.json.results[0].address_components[2].long_name,
                    state: geoCode.json.results[0].address_components[4].short_name,
                    zipcode: geoCode.json.results[0].address_components[6].short_name,
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
                })

            // return the newly created business with contact and location if created
            return db('businesses')
                .transacting(trx)
                .where({ 'businesses.id': added_business[0].id})
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
                        'businesses.business_admin',
                        'businesses.email',
                        'businesses.phone',
                        'businesses.instagram',
                        'businesses.facebook',
                        'businesses.website',
                        'locations.formatted'
                    ]
                )
                .first()
        })
    } catch (error) {
        console.log(error)
        throw error
    }

}

async function updateBusiness(business_id, business_updates) {
    try {
        const { contact_id } = await db('businesses').where({ 'id': business_id }).select(['contact_id']).first()
        
        if (Object.keys(business_updates.contact).length !== 0) {
            await db('contacts').where({ 'id': contact_id }).update(business_updates.contact)
        }

        if (Object.keys(business_updates.business).length !== 0) {
            await db('businesses').where({ 'id': business_id}).update(business_updates.business)
        }

        return db('businesses')
            .where({ 'businesses.id': business_id})
            // .leftJoin('contacts', 'businesses.contact_id', '=', 'contacts.id')
            .leftJoin('locations', 'businesses.id', '=', 'locations.venue_id')
            .select([
                'businesses.id',
                'businesses.name',
                'businesses.avatar',
                'businesses.description',
                'businesses.businesstype',
                'businesses.requestOpen',
                'businesses.activeBusiness',
                'businesses.business_admin',
                'businesses.email',
                'businesses.instagram',
                'businesses.facebook',
                'businesses.website',
                'locations.formatted'
            ])
    } catch (error) {
        // console.log(error)
        throw error
    }
}

async function remove(id) {
    try {
        return await db.transaction(async trx => {
            // get business info
            const business = await db('businesses')
                .transacting(trx)    
                .where({ id: id })
                .select(
                    [
                        'contact_id'
                    ]
                )
                .first()
            console.log(business.contact_id)
            
            // delete location for business to be deleted
            await db('locations')
            .transacting(trx)
            .where({ venue_id: id })
            .del()
            
            //! need to delete from admin roles
            //! need to delete business avatar from s3 bucket
            
            // delete business account
            await db('businesses')
            .transacting(trx)
            .where({ id: id })
            .del()
            
            // delete contact for business to be deleted
            return db('contacts')
                    .transacting(trx)
                    .where({ id: business.contact_id })
                    .del()
        })
    } catch (error) {
        throw error
    }
}