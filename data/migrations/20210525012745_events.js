
exports.up = function (knex) {
    return knex.schema.createTable('events', events => {
        events.increments('id')

        events
            .string('eventname')
            .notNullable()

        events
            .date('eventdate')
            .notNullable()

        events
            .integer('eventstart')
            .notNullable()

        events
            .integer('eventend')
            .notNullable()

        events.string('eventmedia')

        events
            .integer('location_id')
            .unsigned()
            .references('id')
            .inTable('locations')
            .notNullable()

        events.text('details', 'longtext')

        events
            .integer('brand_id')
            .unsigned()
            .references('id')
            .inTable('businesses')

        events
            .integer('created_by')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')

        events.timestamps(true, true)
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('events');
};