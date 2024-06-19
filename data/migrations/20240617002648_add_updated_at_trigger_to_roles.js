exports.up = async function (knex) {
    // create a trigger function to update updated_at when changes are made
    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_modified_column()
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
        FOR EACH ROW EXECUTE FUNCTION update_modified_column();
    `);
  
};

exports.down = async function (knex) {
    // drop the trigger from the roles table
    await knex.raw(`DROP TRIGGER IF EXISTS set_updated_at ON roles`);
    
    // drop the trigger function
    await knex.raw(`DROP FUNCTION IF EXISTS update_modified_column`);
};
