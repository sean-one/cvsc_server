
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
            .onDelete('cascade')

        roles
            .uuid('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()
            .onDelete('cascade')

        roles
            .unique(['user_id', 'business_id'])
        
        roles
            .enu('role_type', [process.env.CREATOR_ACCOUNT, process.env.MANAGER_ACCOUNT, process.env.ADMIN_ACCOUNT])
            .notNullable()
            .defaultTo(process.env.CREATOR_ACCOUNT)
        
        roles
            .boolean('active_role')
            .defaultTo(false)
        
        roles
            .uuid('approved_by')
            .unsigned()
            .references('id')
            .inTable('users')
            .onDelete('cascade')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles');
};
