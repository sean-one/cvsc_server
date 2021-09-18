
exports.up = function (knex) {
    return knex.schema.createTable('businesses', businesses => {
        businesses.increments('id')

        businesses
            .string('name')
            .notNullable()

        businesses
            .string('email')
            .notNullable()

        businesses.string('avatar')

        businesses.text('description', 'longtext')

        businesses
            .enu('businesstype', ['brand', 'venue', 'both'])
            .notNullable()

        businesses.string('contact')

        businesses
            .specificType('useradmin', 'integer []')

        businesses
            .boolean('requestOpen')
            .defaultTo(true)
            .notNullable()

        businesses.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};