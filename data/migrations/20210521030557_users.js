
exports.up = function(knex) {
    return knex.schema.createTable('users', users => {
        users.increments('id')

        users
            .string('username')
            .notNullable()
        
        users
            .string('email')
            .notNullable()
            .unique()
            
        users.string('avatar')
        users.string('password')
        users.string('role')

        users.timestamps(true, true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
