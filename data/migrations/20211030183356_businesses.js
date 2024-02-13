
exports.up = async function (knex) {
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
            .string('formatted_address')
            .defaultTo(null)
            
        businesses
            .string('place_id')
            .defaultTo(null)

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
        
        businesses
            .uuid('admin_fallback')
            .unsigned()
            .references('id')
            .inTable('users')
            .nullable()
            .onDelete('SET NULL')
            .defaultTo(null)
        
        businesses.timestamps(true, true)
    })

    // add a CHECK constraint to ensure 'formatted_address' and 'place_id' must both be true or null
    await knex.schema.raw(`
        ALTER TABLE businesses
        ADD CONSTRAINT check_formatted_address_and_place_id
        CHECK (
            (formatted_address IS NULL AND place_id IS NULL) OR
            (formatted_address IS NOT NULL AND place_id IS NOT NULL)
        )
    `);

    // add a CHECK constraint to ensure 'formatted_address' and 'place_id' must both be true if 'business_type' is 'venue' or 'both'
    await knex.schema.raw(`
        ALTER TABLE businesses
        ADD CONSTRAINT check_formatted_address_and_place_id_required
        CHECK (
            (business_type NOT IN ('venue', 'both')) OR
            (business_type IN ('venue', 'both') AND formatted_address IS NOT NULL AND place_id IS NOT NULL)
        )
    `);
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('businesses');
};