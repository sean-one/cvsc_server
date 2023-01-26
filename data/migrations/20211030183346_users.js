
exports.up = function (knex) {
    return knex.schema.createTable('users', users => {
        users
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        users
            .string('username')
            .notNullable()
            .unique()
        
        users
            .string('password')

        users
            .string('avatar')
            .defaultTo(null)

        users
            .string('email')
            .defaultTo(null)
        
        users
            .string('google_id')
            .defaultTo(null)
        
        users
            .string('refreshToken')
            .defaultTo(null)
        
        users.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
