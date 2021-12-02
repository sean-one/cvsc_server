
exports.up = function (knex) {
    return knex.schema.createTable('users', users => {
        users.increments('id')

        users
            .string('username')
            .notNullable()
            .unique()

        users
            .integer('contact_id')
            .unsigned()
            .references('id')
            .inTable('contacts')

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
