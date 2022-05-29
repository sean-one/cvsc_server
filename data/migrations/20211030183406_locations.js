
exports.up = function (knex) {
    return knex.schema.createTable('locations', locations => {
        locations
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        locations
            .string('venue_name')
            .notNullable()

        locations
            .uuid('venue_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()
            .unique()
            .onDelete('cascade')

        locations
            .string('street_address')
            .notNullable()

        locations
            .string('location_city')
            .notNullable()

        locations
            .string('location_state')
            .notNullable()

        locations
            .string('zip_code')
            .notNullable()

        locations
            .string('formatted')
            .notNullable()

        locations
            .string('place_id')
            .notNullable()
            .unique()
    })

};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('locations');
};
