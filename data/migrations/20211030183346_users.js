
exports.up = function (knex) {
    return knex.schema.createTable('users', users => {
        users
            .uuid('id')
            .primary()
            .defaultTo(knex.raw('gen_random_uuid()'))

        users
            .string('username')
            .notNullable()
            .unique()
        
        users
            .string('password')

        users
            .string('avatar')
            .defaultTo(null)

        users
            .string('email')
            .defaultTo(null)
            .unique()
        
        users
            .boolean('email_verified')
            .defaultTo(false)
        
        users
            .string('email_verified_pending')
            .defaultTo(null)
        
        users
            .string('reset_password_token')
            .nullable()
        
        users
            .boolean('is_superadmin')
            .defaultTo(false)
        
        users
            .string('mfa_secret')
        
        users
            .boolean('mfa_enabled')
            .defaultTo(false)
        
        users
            .string('google_id')
            .defaultTo(null)
        
        users
            .string('refreshToken')
            .defaultTo(null)
        
        users.timestamps(true, true)
    })
    .then(function () {
        return knex.raw(`
            CREATE OR REPLACE FUNCTION update_modified_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
    })
    .then(function () {
        return knex.raw(`
            CREATE TRIGGER set_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
        `);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users')
    .then(function () {
        return knex.raw(`DROP TRIGGER IF EXISTS set_updated_at ON users`);
    })
    .then(function () {
        return knex.raw(`DROP FUNCTION IF EXISTS update_modified_column`);
    });
};
