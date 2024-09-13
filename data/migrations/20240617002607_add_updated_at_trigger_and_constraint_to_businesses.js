exports.up = async function (knex) {
    // create a trigger function to update updated_at when changes are made
    await knex.raw(`
        CREATE OR REPLACE FUNCTION update_modified_businesses_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    // create the trigger for the business table
    await knex.raw(`
        CREATE TRIGGER set_updated_at BEFORE UPDATE ON businesses
        FOR EACH ROW EXECUTE FUNCTION update_modified_businesses_column();
    `);

    // add check to make sure both formatted address and place id are there or missing not one or the other
    await knex.schema.raw(`
        ALTER TABLE businesses
        ADD CONSTRAINT check_formatted_address_and_place_id
        CHECK (
            (formatted_address IS NULL AND place_id IS NULL) OR
            (formatted_address IS NOT NULL AND place_id IS NOT NULL)
        )
    `)
};

exports.down = async function (knex) {
    // drop the trigger for the businesses table
    await knex.raw(`DROP TRIGGER IF EXISTS set_updated_at ON businesses`);
    
    // drop the trigger function
    await knex.raw(`DROP FUNCTION IF EXISTS update_modified_businesses_column`);
    
    // drop the check constraint
    await knex.schema.raw(`
        ALTER TABLE businesses
        DROP CONSTRAINT IF EXISTS check_formatted_address_and_place_id
    `);
};
