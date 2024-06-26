const db = require('../dbConfig');
const { deleteImageS3 } = require('../../utils/s3');

module.exports = {
    getAllUsers,
    createUser,
    findUserById,
    updateUser,
    addRefreshToken,
    updateMfaSecret,
    validateMfaSecret,
    checkMfaSecret,
    markValidationPending,
    markResetPasswordPending,
    validateEmailVerify,
    validatePasswordReset,
    removeRefreshToken,
    findByRefresh,
    getUserAccount,
    findByGoogleId,
    findByUsername,
    findByEmail,
    findByResetToken,
    checkUsernameDuplicate,
    checkEmailVerifiedStatus,
    checkResetStatus,
    removeUser,
};

async function getAllUsers() {
    return await db('users')
        .select([
            'users.id',
            'users.username',
            'users.email',
            'users.email_verified',
            'users.mfa_enabled',
        ])
}

// register - createUser
async function createUser(user) {
    try {
        return await db('users')
            .insert(user, [
                'id',
                'username',
                'email',
                'avatar',
                'is_superadmin',
                'email_verified',
                'mfa_enabled'
            ])
    } catch (error) {
        console.error('Error creating new user:', error);
        throw new Error('create_user_server_error')
    }
}

// userRoute - '.post(/users/update)'
async function findUserById(id) {
    try {
        return await db('users')
            .where({ 'users.id': id })
            .select([
                'users.id',
                'users.username',
                'users.avatar',
                'users.email',
                'users.email_verified',
                'users.is_superadmin',
                'users.mfa_enabled',

            ])
            .first()
    } catch (error) {
        console.error('Error finding user by id:', error)
        throw new Error('user_find_id_server_error')
    }
}

// passport-config - local strategy - check_user
function findByUsername(username) {
    try {
        return db('users')
            .where({ username: username })
            .select(
                [
                    'users.id',
                    'users.username',
                    'users.avatar',
                    'users.email',
                    'users.password',
                    'users.is_superadmin',
                    'users.email_verified',
                    'users.mfa_enabled'
                ]
            )
            .first()
    } catch (error) {
        console.error('Error finding user by username:', error)
        throw new Error('user_find_username_server_error')
    }
}

// userRoute - '.post(/users/forgot-password)'
function findByEmail(email) {
    try {
        return db('users')
            .where({ email: email })
            .select(
                [
                    'users.id',
                    'users.email_verified',
                    'users.email',
                ]
            )
            .first()
    } catch (error) {
        console.error('Error finding user by email:', error)
        throw new Error('user_find_email_server_error')
    }
}

// userRoute - '.post(/users/reset-password/:token)
async function findByResetToken(token) {
    try {
        return db('users')
            .where({ reset_password_token: token })
            .select(
                [
                    'users.id',
                    'users.email'
                ]
            )
            .first()
    } catch (error) {
        console.error('Error finding user by reset password token:', error)
        throw new Error('user_find_reset_token_server_error')
    }
}

// userRoute - '/users/update'
async function updateUser(user_id, updates) {
    try {
        await db('users').where({ id: user_id }).update(updates)
    
        return await db('users')
            .where({ 'users.id': user_id })
            .select(
                [
                    'users.id',
                    'users.username',
                    'users.avatar',
                    'users.email',
                    'users.is_superadmin',
                    'users.email_verified',
                    'users.mfa_enabled'
                ]
            )
            .first()
    } catch (error) {
        console.error('Error updating user:', error)
        throw new Error('update_user_server_error')
    }
}

// authRoute - '/logout' & '/refresh'
async function findByRefresh(token) {
    try {
        return await db('users')
            .where({ refreshToken: token })
            .select(
                [
                    'users.id',
                    'users.username',
                    'users.avatar',
                    'users.email',
                    'users.is_superadmin',
                    'users.email_verified',
                    'users.mfa_enabled'
                ]
            )
            .first()
    } catch (error) {
        console.error('Error finding user by refresh:', error)
        throw new Error('user_find_refresh_server_error')
    }
}

// authRoute - '/logout'
async function removeRefreshToken(user_id) {
    try {
        return await db('users')
            .where({ id: user_id })
            .update({ refreshToken: null })
    } catch (error) {
        console.error('Error removing user refresh:', error)
        throw new Error('user_remove_refresh_server_error')
    }
}

// passport-config - serialize user
async function addRefreshToken(id, token) {
    return await db('users')
        .where({ id: id })
        .update({ refreshToken: token })
}

// authRoute - '/generate-mfa'
async function updateMfaSecret(user_id, mfa_temp_secret) {
    await db('users').where({ id: user_id }).update({ mfa_secret: mfa_temp_secret })
}

// authRoute - '/verify-mfa'
async function validateMfaSecret(user_id) {
    await db('users').where({ id: user_id }).update({ mfa_enabled: true })
}

// authRoute - '/verify-mfa'
async function checkMfaSecret(user_id) {
    try {
        return await db('users')
            .where({ 'users.id': user_id })
            .select([
                'users.id',
                'users.username',
                'users.mfa_secret',

            ])
            .first()
    } catch (error) {
        console.error('Error finding user MFA:', error)
        throw new Error('user_find_id_server_error')
    }
}

// userRoute - '/send-verification-email
async function markValidationPending(user_id, token) {
    await db('users').where({ id: user_id }).update({ email_verified_pending: token })
}

// userRoute - '/forgot-password
async function markResetPasswordPending(email, token) {
    await db('users').where({ email: email }).update({ reset_password_token: token })
}

// userRoute - '/verify-email
async function validateEmailVerify(user_id, email) {
    await db('users').where({ id: user_id }).update({ email: email, email_verified: true, email_verified_pending: null })
}

// userRoute - '/reset-password/:token
async function validatePasswordReset(email, password) {
    await db('users').where({ email: email }).update({ password: password, reset_password_token: null })

    return await db('users')
        .where({ 'users.email': email })
        .select(
            [
                'users.username',
            ]
        )
        .first()
}

// passport-config - deserialize user
async function getUserAccount(id) {
    const user = await db('users')
        .where({ 'users.id': id })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.email',
                'users.is_superadmin',
                'users.email_verified',
                'users.mfa_enabled'
            ]
        ).first()
    const active_user_roles = await db('roles').where({ 'roles.user_id': id, 'roles.active_role': true }).select(['roles.business_id', 'roles.role_type']).orderBy('role_type', 'desc')
    
    return { user: user, roles: active_user_roles || [] }
}

//! passport-config - GoogleStrategy
async function findByGoogleId(google_id) {
    return await db('users')
        .where({ google_id: google_id })
        .select(
            [
                'users.id',
                'users.username',
                'users.avatar',
                'users.email',
                'users.is_superadmin',
                'users.email_verified',
                'users.mfa_enabled'
            ]
        )
        .first()
}

// check for username duplicate and retur username if found
function checkUsernameDuplicate(username) {
    return db('users')
        .where(db.raw('LOWER(username) ILIKE ?', username.toLowerCase()))
        .select([ 'users.username' ])
        .first()
}

// check for email_verified_pending
async function checkEmailVerifiedStatus(user_id) {
    return await db('users').where({ id: user_id }).select([ 'users.email_verified_pending' ]).first()
}

// check for password reset pending
async function checkResetStatus(email) {
    return await db('users').where({ email: email }).select([ 'users.reset_password_token' ]).first()
}

// userRoute - '/users/delete'
async function removeUser(user_id) {
    try {
        return await db.transaction(async trx => {
            // image keys to be deleted - businesss_avatar, eventmedia, & user avatar
            let keys_to_delete = []
            // business_ids of all business with user lsited as admin
            let admin_businesses = []
            // event ids of all events needing to be deleted
            let events_to_delete =[]
    
            // collect image keys (business_avatar) and business_id from businesses created
            const businesses = await db('businesses')
                .transacting(trx)
                .where({ 'businesses.business_admin': user_id })
                .select([
                    'businesses.id',
                    'businesses.business_avatar',
                ])
            
            if(!!businesses) {
                admin_businesses = businesses.map(business => business.id)
                let business_avatars = businesses.map(business => business.business_avatar)
                keys_to_delete = [...keys_to_delete, ...business_avatars]
            }
            
            // collect image keys (eventmedia) from events with soon to be deleted business
            const business_events = await db('events')
                .transacting(trx)
                .whereIn('events.host_business', admin_businesses)
                .select([
                    'events.id',
                    'events.eventmedia',
                ])
    
            if(!!business_events) {
                let business_events_to_delete = business_events.map(event => event.id)
                events_to_delete = [ ...events_to_delete, ...business_events_to_delete ]
                let business_event_media = business_events.map(event => event.eventmedia)
                keys_to_delete = [ ...keys_to_delete, ...business_event_media ]
            };
            
            // collect image keys (eventmedia) from created events
            const user_events = await db('events')
                .transacting(trx)
                .where({ 'events.created_by': user_id })
                .select([
                    'events.id',
                    'events.eventmedia'
                ])
            
            if(!!user_events) {
                let user_events_to_delete = user_events.map(event => event.id)
                events_to_delete = [ ...events_to_delete, ...user_events_to_delete ]
                let user_event_media = user_events.map(event => event.eventmedia)
                keys_to_delete = [ ...keys_to_delete, ...user_event_media ]
            }
    
            // collect image key (avatar) from user account
            const { avatar } = await db('users')
                .transacting(trx)
                .where({ 'users.id': user_id })
                .select([ 'users.avatar' ])
                .first()
    
            if(!!avatar) { keys_to_delete = [ ...keys_to_delete, avatar ] }

            // delete all roles for user to be deleted
            await db('roles').transacting(trx).where({ 'roles.user_id': user_id }).del();

            // delete all roles for businesses to be deleted
            await db('roles').transacting(trx).whereIn('roles.business_id', admin_businesses).del();

            // delete all businesses where user to be deleted is admin
            await db('businesses').transacting(trx).whereIn('businesses.id', admin_businesses).del();

            // delete all events from user and businesses to be deleted
            await db('events').transacting(trx).whereIn('events.id', events_to_delete).del();
    
            // deletes user - CASCADES event creator, business admin, business roles
            const deleted_user = await db('users').transacting(trx).where({ 'users.id': user_id }).del();
            
            // remove all images for user created business, created events & profile image
            if (keys_to_delete.length !== 0) {
                await Promise.all(keys_to_delete.map(async image_key => {
                    return deleteImageS3(image_key);
                }));
            }

            return deleted_user;
        })

    } catch (error) {
        console.error(error)
        throw error
    }
}