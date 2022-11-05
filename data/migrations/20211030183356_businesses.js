
exports.up = function (knex) {
    return knex.schema.createTable('businesses', businesses => {
        businesses
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        businesses
            .string('business_name')
            .notNullable()
            .unique()

        businesses.string('business_avatar')

        businesses.text('business_description', 'longtext')

        businesses
            .enu('business_type', ['brand', 'venue', 'both'])
            .notNullable()

        businesses
            .string('business_email')
            .notNullable()

        businesses
            .bigInteger('business_phone')
            .nullable()
            .defaultTo(null)
        
        businesses
            .string('business_instagram')
            .nullable()
            .defaultTo(null)
        
        businesses
            .string('business_twitter')
            .nullable()
            .defaultTo(null)
        
        businesses
            .string('business_facebook')
            .nullable()
            .defaultTo(null)
        
        businesses
            .string('business_website')
            .nullable()
            .defaultTo(null)

        // business open to user creator request, defaults to true
        businesses
            .boolean('business_request_open')
            .defaultTo(true)
        
        businesses
            .boolean('active_business')
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