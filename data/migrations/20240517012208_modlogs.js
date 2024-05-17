
exports.up = function(knex) {
    return knex.schema.createTable('modlogs', modlogs => {
        modlogs
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        modlogs
            .string('action')
            .notNullable();

        modlogs
            .uuid('target_id')
            .notNullable();

        modlogs
            .string('target_type')
            .notNullable();

        modlogs
            .timestamp('created_at')
            .defaultTo(knex.fn.now());
    })
  
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('modlogs');
};
