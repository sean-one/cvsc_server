
exports.up = function(knex) {
    return knex.schema.createTable('pendingRequests', pendingRequests => {
        pendingRequests.increments('id')

        pendingRequests
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()
        
        pendingRequests
            .string('username')
            .notNullable()
        
        pendingRequests
            .integer('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()
        
        pendingRequests
            .unique([ 'user_id', 'business_id' ])
        
        pendingRequests
            .enu('request_for', ['admin', 'creator'])
            .notNullable()
        
        pendingRequests
            .enu('request_status', ['open', 'rejected'])
            .defaultTo('open')
            .notNullable()
    })
  
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('pendingRequests')
  
};
