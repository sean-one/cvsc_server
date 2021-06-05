
exports.up = function(knex) {
    return knex.schema.createTable('locations', locations => {
        locations.increments('id')

        locations
            .string('venue_name')
            .notNullable()

        locations
            .string('street')
            .notNullable()

        locations
            .string('city')
            .notNullable()

        locations
            .string('state')
            .notNullable()

        locations
            .string('zipcode')
            .notNullable()

        locations
            .string('formatted')
            .notNullable()

        locations
            .string('place_id')
            .notNullable()      
    })
  
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('locations');
};
