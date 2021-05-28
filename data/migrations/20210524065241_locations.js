
exports.up = function(knex) {
    return knex.schema.createTable('locations', locations => {
        locations.increments('id')

        locations.string('venue_name')
        locations.string('street')
        locations.string('city')
        locations.string('state')
        locations.string('zipcode')
        locations.string('formatted')
        locations.string('place_id')
    })
  
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('locations');
};
