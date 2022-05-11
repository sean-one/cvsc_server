
exports.up = function (knex) {
    return knex.schema.createTable('businesses', businesses => {
        businesses
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

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
            .uuid('contact_id')
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
            .uuid('business_admin')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()
            .onDelete('cascade')

        businesses.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};