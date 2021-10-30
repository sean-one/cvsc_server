
exports.up = function (knex) {
    return knex.schema.createTable('roles', roles => {
        roles.increments('id')

        roles
            .integer('user_id')
            .unsigned()
            .references('id')
            .inTable('users')
            .notNullable()

        roles
            .integer('business_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            .notNullable()
        roles
            .enu('roletype', ['admin', 'creator'])
            .notNullable()
            .defaultTo('creator')
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('roles');
};
