
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
        
        businesses
            .string('business_instagram')
        
        businesses
            .string('business_twitter')
        
        businesses
            .string('business_facebook')
        
        businesses
            .string('business_website')

        // business open to user creator request, defaults to true
        businesses
            .boolean('business_request_open')
            .nullable()
            .defaultTo(true)
        
        businesses
            .boolean('active_business')
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