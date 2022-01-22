
exports.up = function (knex) {
    return knex.schema.createTable('roles', roles => {
        roles.increments('id')

        roles
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()

        roles
            .integer('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()

        roles
            .unique(['user_id', 'business_id'])
        
        roles
            .enu('role_type', ['admin', 'creator'])
            .notNullable()
            .defaultTo('creator')
        
        roles
            .boolean('active_role')
            .defaultTo(false)
        
        roles
            .integer('approved_by')
            .unsigned()
            .references('id')
            .inTable('users')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles');
};
