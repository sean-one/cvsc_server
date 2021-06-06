
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

        businesses
            .integer('location')
            .unsigned()
            .references('id')
            .inTable('locations')

        businesses.text('description', 'longtext')
        
        businesses
            .enu('businesstype', ['brand', 'venue', 'both'])
            .notNullable()

        businesses.string('contact')

        businesses.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};