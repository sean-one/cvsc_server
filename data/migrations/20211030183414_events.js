
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
            .string('place_id')
            .notNullable()
        
        events
            .string('formatted_address')
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

        events
            .string('eventmedia')
            .notNullable()

        events.text('details', 'longtext')

        events
            .uuid('host_business')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('businesses')
            .onDelete('cascade')

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