const db = require('../dbConfig');
// const googleMapsClient = require('../../helpers/geocoder');
// const { Client } = require('@googlemaps/google-maps-services-js');
const { deleteImageS3 } = require('../../s3');

module.exports = {
    getAllBusinesses,
    getBusinessById,
    getBusinessManagement,
    checkBusinessName,
    addBusiness,
    updateBusiness,
    toggleActiveBusiness,
    toggleBusinessRequest,
    removeBusiness
};

function getAllBusinesses() {
    return db('businesses')
        // .where({ active_bus  iness: true })
        .leftJoin('users', 'businesses.business_admin', '=', 'users.id')
        .select(
            [
                'businesses.id',
                'businesses.business_name',
                'businesses.formatted_address',
                'businesses.place_id',
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
            ]
        )
}

// .put('/business/update/:business_id)
function getBusinessById(business_id) {
    return db('businesses')
        .where({ 'businesses.id': business_id })
        .select(
            [
                'businesses.id',
                'businesses.business_name',
                'businesses.formatted_address',
                'businesses.place_id',
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
            ]
        )
        .first();
}

// .get('/businesses/management')
async function getBusinessManagement(user_id) {
    try {
        const { business_ids } = await db('roles')
            .where({ user_id: user_id, active_role: true })
            .andWhere('role_type', '>=', process.env.MANAGER_ACCOUNT)
            .select(
                [
                    db.raw('ARRAY_AGG(roles.business_id) as business_ids')
                ]
            )
            .first()
        
        // if no roles with role type of manager or admin throw non manager error    
        if (business_ids === null) { throw new Error('non_manager') }
        
        return db('businesses')
            .whereIn('id', business_ids)
            .select(
                [
                    'businesses.id',
                    'businesses.business_name',
                    'businesses.formatted_address',
                    'businesses.place_id',
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
                ]
            )

    } catch (error) {
        // if user_id is not properly formatted as a uuid
        if (error?.routine === 'string_to_uuid') {
            throw new Error('string_to_uuid')
        }

        // if no management roles were found
        if (error?.message === 'non_manager') {
            throw new Error('non_manager')
        }

        // fall back in case of unexpected errors
        throw new Error('server_error')
    }
}

// .post('/business/create') - checks if business name is already in use
function checkBusinessName(business_name) {
    return db('businesses')
        .where(db.raw('LOWER(business_name) ILIKE ?', business_name.toLowerCase()))
        .select([ 'businesses.id' ])
        .first()
}

// .post('/business/create) - creates a new business
async function addBusiness(business) {
    try {
        
        return await db.transaction(async trx => {
            
            // insert new business into database
            const added_business = await db('businesses')
                .transacting(trx)
                .insert(business, ['id', 'business_name', 'business_admin', 'business_type'])
            
            // create a business_admin role for the user requesting the new business
            await db('roles')
                .transacting(trx)
                .insert({
                    user_id: added_business[0].business_admin,
                    business_id: added_business[0].id,
                    role_type: process.env.ADMIN_ACCOUNT,
                    active_role: true,
                    approved_by: added_business[0].business_admin
                }, [ 'id' ])

            // return the newly created business with contact and location if available
            return db('businesses')
                .transacting(trx)
                .where({ 'businesses.id': added_business[0].id})
                .join('roles', 'businesses.id', '=', 'roles.business_id')
                .select(
                    [
                        'businesses.id',
                        'businesses.business_name',
                        'businesses.formatted_address',
                        'businesses.place_id',
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
                        'roles.id as admin_role_id',
                        'roles.active_role',
                        'roles.role_type',
                    ]
                )
                .first()
        })
    } catch (error) {
        throw error
    }

}

// .put('/business/update/:business_id) - updates existing business
async function updateBusiness(business_id, changes, user_id) {
    try {
        const { role_type } = await db('roles').where({ business_id: business_id, user_id: user_id }).first()
        const { place_id } = await db('businesses').where({ id: business_id }).first()
        
        
        if(role_type === process.env.ADMIN_ACCOUNT) {
            if(changes?.business_type && changes?.business_type === 'venue' || changes?.business_type === 'both' && (!changes?.place_id && !place_id)) {
                throw new Error('missing_location')
            }
            
        }
        
        if(Object.keys(changes).length > 0) {
            await db('businesses').where({ id: business_id }).update(changes)
        }

        return db('businesses')
            .where({ 'businesses.id': business_id})
            .select([
                'businesses.id',
                'businesses.business_name',
                'businesses.formatted_address',
                'businesses.place_id',
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
            ])
            .first()
    } catch (error) {
        throw error
    }
}

// .put('/:business_id/toggle)
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
            .select([
                'businesses.id',
                'businesses.business_name',
                'businesses.formatted_address',
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
            ])
            .first()
    })
}

// .put('/:business_id/toggle)
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
            .select(
                [
                    'businesses.id',
                    'businesses.business_name',
                    'businesses.formatted_address',
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
                ]
            )
            .first()
}

// .delete('/business/remove/:business_id') - removes business account, roles, removes from events and marks inactive
async function removeBusiness(business_id) {
    try {
        const check_link = /^(http|https)/g
        const { business_avatar } = await db('businesses')
            .where({ id: business_id })
            .select([ 'businesses.business_avatar' ])
            .first()

        const deleted_business = await db.transaction(async trx => {
            
            await db('events')
                .transacting(trx)
                .where({ venue_id: business_id })
                .orWhere({ brand_id: business_id })
                .update({ active_event: false })

            // delete all from roles
            await db('roles')
                .transacting(trx)
                .where({ business_id: business_id})
                .del()
            
            // delete from the businesses table
            return await db('businesses')
                .transacting(trx)
                .where({ id: business_id })
                .del()

        })

        if(deleted_business >= 1) {
            if(!check_link.test(business_avatar) && business_avatar !== null) {
                await deleteImageS3(business_avatar)
            }
        }

        return deleted_business

    } catch (error) {
        throw error
    }
}