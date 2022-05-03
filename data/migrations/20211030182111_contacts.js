
exports.up = function(knex) {
  return knex.schema.createTable('contacts', contacts => {
        contacts
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        contacts
            .string('email')
            .unique()

        contacts
            .string('instagram')
      
        contacts
            .string('facebook')
      
        contacts
            .string('website')
        
        contacts.timestamps(true, true)
  })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('contacts');
};
