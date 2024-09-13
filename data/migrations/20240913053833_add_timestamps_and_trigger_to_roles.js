exports.up = async function (knex) {
    // add created_at and updated_at columns to roles table
    await knex.schema.alterTable('roles', roles => {
        roles.timestamps(true, true);
    });

    // create a trigger function to update updated_at when changes are made
    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_modified_roles_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // create the trigger for the roles table
    await knex.raw(`
        CREATE TRIGGER set_updated_at BEFORE UPDATE ON roles
        FOR EACH ROW EXECUTE FUNCTION update_modified_roles_column();
    `);
  
};

exports.down = async function (knex) {
    // Drop the trigger from the roles table
    await knex.raw(`DROP TRIGGER IF EXISTS set_updated_at ON roles`);

    // After dropping all dependent triggers, drop the function
    await knex.raw(`DROP FUNCTION IF EXISTS update_modified_roles_column`);
};