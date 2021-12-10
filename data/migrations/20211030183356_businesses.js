
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

        businesses
            .integer('contact_id')
            .unsigned()
            .references('id')
            .inTable('contacts')

        businesses
            .boolean('requestOpen')
            .nullable()
            .defaultTo(true)
        
        businesses
            .boolean('activeBusiness')
            .nullable()
            .defaultTo(false)

        businesses.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};