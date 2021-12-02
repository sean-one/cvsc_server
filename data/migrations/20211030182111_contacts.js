
exports.up = function(knex) {
  return knex.schema.createTable('contacts', contacts => {
        contacts.increments('id')

        contacts
            .string('email')
            .notNullable()

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
