const db = require('../dbConfig');
const getAccountType = require('../../helpers/getAccountType');
const { deleteImageS3 } = require('../../s3');


module.exports = {
    addBusiness,
    getBusinessById,
    updateBusiness,
    getAllBusinesses,
    toggleActiveBusiness,
    toggleBusinessRequest,
    getBusinessManagement,
    transferBusiness,
    removeBusiness,


    checkBusinessNameDuplicate,
    validateBusinessRequestOpen,
    validateActiveBusiness,
};

// .get('BUSINESSES/)
async function getAllBusinesses() {
    try {
        const all_business_list = await db('businesses')
            // .where({ active_business: true })
            .leftJoin('users', 'businesses.business_admin', '=', 'users.id')
            .select(
                [
                    'businesses.id',
                    'businesses.business_name',
                    'businesses.formatted_address',
                    'businesses.place_id',
                    'businesses.business_avatar',
                    'businesses.business_description',
                    'businesses.business_request_open',
                    'businesses.active_business',
                    'businesses.business_admin',
                    'users.username as admin_user',
                    'businesses.business_email',
                    'businesses.business_phone',
                    'businesses.business_instagram',
                    'businesses.business_website',
                    'businesses.business_twitter',
                    'businesses.business_slug',
                ]
            )
        
        return all_business_list;
    } catch (error) {
        console.error(`Error fetching list of businesses, ${error}`)
        throw new Error('server_error')
    }
}

// .put('BUSINESSES/:business_id)
function getBusinessById(business_id) {
    try {
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
                    'businesses.business_request_open',
                    'businesses.active_business',
                    'businesses.business_admin',
                    'businesses.business_email',
                    'businesses.business_phone',
                    'businesses.business_instagram',
                    'businesses.business_website',
                    'businesses.business_twitter',
                    'businesses.business_slug',
                ]
            )
            .first();
    } catch (error) {
        console.error('Error finding business by id:', error);
        throw new Error('business_find_id_server_error');
    }
}

// .get('BUSINESSES/managed')
async function getBusinessManagement(user_id) {
    try {
        const management_businesses = await db('roles')
            .where({ user_id: user_id, active_role: true })
            .andWhere('role_type', '>=', process.env.MANAGER_ACCOUNT)
            .leftJoin('businesses', 'roles.business_id', '=', 'businesses.id')
            .select(
                [
                    'roles.role_type',
                    'businesses.id',
                    'businesses.business_name',
                    'businesses.formatted_address',
                    'businesses.place_id',
                    'businesses.business_avatar',
                    'businesses.business_description',
                    'businesses.business_request_open',
                    'businesses.active_business',
                    'businesses.business_admin',
                    'businesses.business_email',
                    'businesses.business_phone',
                    'businesses.business_instagram',
                    'businesses.business_website',
                    'businesses.business_twitter',
                    'businesses.business_slug',

                ]
            )

        const updated_list = management_businesses.map(obj => ({
            ...obj,
            role_type: getAccountType(obj.role_type)
        }));

        return updated_list;

    } catch (error) {
        // console.error('Error finding users management:', error);
        throw new Error('fetch_business_management_server_error');
    }
}

// .post('/business/create) - creates a new business
async function addBusiness(business) {
    try {
        return await db.transaction(async trx => {
            
            // insert new business into database
            const added_business = await db('businesses')
                .transacting(trx)
                .insert(business, ['id', 'business_name', 'business_admin'])
            
            // create a business_admin role for the user requesting the new business
            await db('roles')
                .transacting(trx)
                .insert({
                    user_id: added_business[0].business_admin,
                    business_id: added_business[0].id,
                    role_type: process.env.ADMIN_ACCOUNT,
                    active_role: true,
                    approved_by: added_business[0].business_admin
                })

            // return the newly created business with contact and location if available
            return db('businesses')
                .transacting(trx)
                .where({ 'businesses.id': added_business[0].id})
                .select(
                    [
                        'businesses.id',
                        'businesses.business_name',
                        'businesses.formatted_address',
                        'businesses.place_id',
                        'businesses.business_avatar',
                        'businesses.business_description',
                        'businesses.business_request_open',
                        'businesses.active_business',
                        'businesses.business_admin',
                        'businesses.business_email',
                        'businesses.business_phone',
                        'businesses.business_instagram',
                        'businesses.business_website',
                        'businesses.business_twitter',
                        'businesses.business_slug',
                    ]
                )
                .first()
        })
    } catch (error) {
        console.error('Error creating new business:', error)
        throw new Error('create_business_server_error')
    }

}

// .put('/business/update/:business_id) - updates existing business
async function updateBusiness(business_id, changes) {
    try {
        return await db.transaction(async trx => {
            
            await db('businesses').transacting(trx).where({ id: business_id }).update(changes)
        
            return db('businesses')
                .transacting(trx)
                .where({ 'businesses.id': business_id})
                .select([
                    'businesses.id',
                    'businesses.business_name',
                    'businesses.formatted_address',
                    'businesses.place_id',
                    'businesses.business_avatar',
                    'businesses.business_description',
                    'businesses.business_request_open',
                    'businesses.active_business',
                    'businesses.business_admin',
                    'businesses.business_email',
                    'businesses.business_phone',
                    'businesses.business_instagram',
                    'businesses.business_website',
                    'businesses.business_twitter',
                    'businesses.business_slug',
                ])
                .first()
        })
    } catch (error) {
        console.error('Error updating business:', Object.keys(error));
        throw new Error('update_business_server_error');
    }
}

// .put('/:business_id/toggle)
async function toggleActiveBusiness(business_id) {
    try {
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
                    'businesses.business_request_open',
                    'businesses.active_business',
                    'businesses.business_admin',
                    'businesses.business_email',
                    'businesses.business_phone',
                    'businesses.business_instagram',
                    'businesses.business_website',
                    'businesses.business_twitter',
                    'businesses.business_slug',
                ])
                .first()
        })
    
    } catch (error) {
        console.error('Error attempting to toggle active business status:', error)
        throw new Error('active_business_toggle_server_error')    
    }

}

// .put('/:business_id/toggle)
async function toggleBusinessRequest(business_id) {
    try {
        const business = await db('businesses')
            .where({ 'businesses.id': business_id })
            .select(
                [
                    'businesses.id',
                    'businesses.business_request_open'
                ]
            )
            .first()
        
        // toggle business request to the opposite of what it was
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
                        'businesses.business_request_open',
                        'businesses.active_business',
                        'businesses.business_admin',
                        'businesses.business_email',
                        'businesses.business_phone',
                        'businesses.business_instagram',
                        'businesses.business_website',
                        'businesses.business_twitter',
                        'businesses.business_slug',
                    ]
                )
                .first()
        
    } catch (error) {
        console.error('Error attempting to toggle business request status:', error);
        throw new Error('business_request_toggle_server_error');
    }
}

// .put('/:business_id/transfer/:manager_id')
async function transferBusiness(business_id, manager_id, admin_id) {
    try {
        return await db.transaction(async trx => {
            await db('roles')
                .transacting(trx)
                .where({ business_id: business_id, user_id: admin_id})
                .update({ role_type: process.env.MANAGER_ACCOUNT, approved_by: manager_id})
            
            await db('roles')
                .transacting(trx)
                .where({ business_id: business_id, user_id: manager_id })
                .update({ role_type: process.env.ADMIN_ACCOUNT, approved_by: manager_id })
            
            await db('businesses')
                .transacting(trx)
                .where({ id: business_id })
                .update({ business_admin: manager_id })
            
            return { business_id, admin_id }
        })
    } catch (error) {
        console.error('Error during business tranfer:', error)
        throw new Error('business_transfer_server_error')
    }
}

// .delete('/business/remove/:business_id') - removes business account, roles, removes from events and marks inactive
async function removeBusiness(business_id) {
    try {
        const check_link = /^(http|https)/g
        const { business_avatar, business_name, business_admin } = await db('businesses')
            .where({ id: business_id })
            .select([ 'businesses.business_avatar', 'businesses.business_name', 'businesses.business_admin' ])
            .first()
        
        const deleted_business = await db.transaction(async trx => {
            
            // remove business from events
            await db('events')
                .transacting(trx)
                .where({ host_business: business_id })
                .del()
            
            // remove all business roles
            await db('roles')
                .transacting(trx)
                .where({ business_id: business_id})
                .del()
            
            // delete businesses
            return await db('businesses')
                .transacting(trx)
                .where({ id: business_id })
                .del()

        })

        const success = deleted_business > 0

        if (success) {
            await deleteImageS3(business_avatar)
        }

        return { success, business_id, business_name, business_admin };

    } catch (error) {
        console.error('Error deleting business:', error)
        throw new Error('delete_business_server_error');
    }
}


//! VALIDATORS
// isBusinessNameUnique - checks if business_name is already in use
function checkBusinessNameDuplicate(business_name) {
    return db('businesses')
        .where(db.raw('LOWER(business_name) ILIKE ?', business_name.toLowerCase()))
        .select(['businesses.id'])
        .first()
        .then(business => !!business)
}
// validateRoleRequest - check that business_request_open is set to true
function validateBusinessRequestOpen(business_id) {
    return db('businesses')
        .where({ id: business_id, business_request_open: true })
        .select(['businesses.id'])
        .first()
        .then(business => !!business)
}
// validateRoleAction - check that active_business is set to true
function validateActiveBusiness(business_id) {
    return db('businesses')
        .where({ id: business_id, active_business: true })
        .select(['businesses.id'])
        .first()
        .then(business => !!business)
}