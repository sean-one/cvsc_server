
exports.up = async function (knex) {
    return knex.schema.createTable('events', events => {
        events
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        events
            .string('eventname')
            .notNullable()
            .unique()

        events
            .date('eventdate')
            .notNullable()

        events
            .integer('eventstart')
            // .notNullable()

        events
            .integer('eventend')
            // .notNullable()

        events.string('eventmedia')

        events
            .uuid('venue_id')
            .unsigned()
            .references('id')
            .inTable('businesses')
            // .notNullable()
            .onDelete('cascade')

        events.text('details', 'longtext')

        events
            .uuid('brand_id')
            .unsigned()
            .references('id')
            .inTable('businesses')

        events
            .uuid('created_by')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onDelete('cascade')
        
        events
            .boolean('active_event')
            .defaultTo(true)

        events.timestamps(true, true)
    })

    // add constraint to keep unique eventname per date
    await knex.schema.raw(`ALTER TABLE events ADD CONSTRAINT on_per_day UNIQUE (eventname, eventdate);`)
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('events');
};