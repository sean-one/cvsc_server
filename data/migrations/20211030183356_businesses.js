
exports.up = function (knex) {
    return knex.schema.createTable('businesses', businesses => {
        businesses.increments('id')

        businesses
            .string('name')
            .notNullable()
            .unique()

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
            .onDelete('cascade')

        // business open to user creator request, defaults to true
        businesses
            .boolean('requestOpen')
            .nullable()
            .defaultTo(true)
        
        businesses
            .boolean('activeBusiness')
            .nullable()
            .defaultTo(false)
        
        businesses
            .integer('business_admin')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()

        businesses.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};