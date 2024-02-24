
exports.up = function(knex) {
    return knex.schema.createTable('business_tags', business_tags => {
        business_tags
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))
        
        business_tags
            .uuid('event_id')
            .unsigned()
            .references('id')
            .inTable('events')
            .notNullable()
            .onDelete('cascade')
        
        business_tags
            .uuid('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()
            .onDelete('cascade')
        
        business_tags
            .uuid('approved_by')
            .unsigned()
            .references('id')
            .inTable('users')
            .onDelete('cascade')
            .defaultTo(null)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('business_tags')
};
