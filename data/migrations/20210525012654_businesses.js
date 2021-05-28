
exports.up = function (knex) {
    return knex.schema.createTable('businesses', businesses => {
        businesses.increments('id')

        businesses.string('name')
        businesses.string('email')
        businesses.string('avatar')

        businesses
            .integer('location')
            .unsigned()
            .references('id')
            .inTable('locations')

        businesses.text('description', 'longtext')
        businesses.enu('type', ['brand', 'venue', 'both'])
        businesses.string('contact')

        businesses.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};