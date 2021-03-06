
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
            .defaultTo("https://coachellavalleysmokers-images.s3.amazonaws.com/default_user_icon.png")

        users
            .string('email')
            .unique()
            .notNullable()
        
        users
            .string('google_id')
            .defaultTo(null)
        
        users.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
