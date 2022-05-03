
exports.up = function (knex) {
    return knex.schema.createTable('roles', roles => {
        roles
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        roles
            .uuid('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()

        roles
            .uuid('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()

        roles
            .unique(['user_id', 'business_id'])
        
        roles
            .enu('role_type', ['admin', 'creator', 'manager'])
            .notNullable()
            .defaultTo('creator')
        
        roles
            .boolean('active_role')
            .defaultTo(false)
        
        roles
            .uuid('approved_by')
            .unsigned()
            .references('id')
            .inTable('users')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles');
};
