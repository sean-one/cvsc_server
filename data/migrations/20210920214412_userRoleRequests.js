
exports.up = function (knex) {
    return knex.schema.createTable('userRoleRequests', userRoleRequests => {
        userRoleRequests.increments('id')

        userRoleRequests
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()

        userRoleRequests
            .integer('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()
        
        userRoleRequests
            .unique([ 'user_id', 'business_id' ])

        userRoleRequests
            .enu('user_rights', ['admin', 'creator'])
            .notNullable()
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('userRoleRequests')

};