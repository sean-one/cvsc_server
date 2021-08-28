
exports.up = function(knex) {
    return knex.schema.createTable('users', users => {
        users.increments('id')

        users
            .string('username')
            .notNullable()
            .unique()
        
        users
            .string('email')
            .notNullable()
            .unique()
            
        users
            .string('password')
            .notNullable()
            
        users
            .string('avatar')
            // create a default profile pic to go here later
            .defaultTo('https://picsum.photos/100/100')
        
        users
            .boolean('isAdmin')
            .defaultTo(false)
            .notNullable()

        users.timestamps(true, true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
