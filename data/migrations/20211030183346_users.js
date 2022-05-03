
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
            .uuid('contact_id')
            .references('id')
            .inTable('contacts')
        
        users
            .enu('account_type', ['admin', 'creator', 'manager', 'basic'])
            .notNullable()
            .defaultTo('basic')

        users
            .string('password')
            .notNullable()

        users
            .string('avatar')
            .defaultTo("https://coachellavalleysmokers-images.s3.amazonaws.com/default_user_icon.png")

        users.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
