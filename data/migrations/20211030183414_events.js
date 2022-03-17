
exports.up = async function (knex) {
    return knex.schema.createTable('events', events => {
        events.increments('id')

        events
            .string('eventname')
            .notNullable()
            .unique()

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
            .integer('venue_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
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

    // add constraint to keep unique eventname per date
    await knex.schema.raw(`ALTER TABLE events ADD CONSTRAINT on_per_day UNIQUE (eventname, eventdate);`)
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('events');
};