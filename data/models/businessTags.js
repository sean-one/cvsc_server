const db = require('../dbConfig');


module.exports = {
    getBusinessTagsByBusiness
}

// .get('BUSINESSTAGS/:business_id)
async function getBusinessTagsByBusiness(business_id) {
    try {
        return await db('business_tags')
            .where({ business_id: business_id, approved_by: null })
            .join('events', 'business_tags.event_id', '=', 'events.id')
            .join('users', 'events.created_by', 'users.id')
            .select(
                [
                    'business_tags.id',
                    'business_tags.business_id',
                    'business_tags.event_id',
                    'business_tags.approved_by',
                    'events.eventname',
                    'events.eventmedia',
                    'events.formatted_address',
                    'users.username'
                ]
            )
    } catch (error) {
        console.error('Error finding business tags by business:', error);
        throw new Error('business_tags_by_business_server_error');
    }
}