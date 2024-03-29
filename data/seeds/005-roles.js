
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('roles').del()
    .then(function () {
      // Inserts seed entries
      return knex('roles').insert([
        // seanone - stiiizy
        { 
          id: 'cd8d4473-adca-4765-806b-8e7447af7576',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: 'b09f358c-6926-47bb-b8fc-20788b92ae16',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - west coast cure
        { 
          id: '21b088a5-bf38-49f0-bea7-12de73d144a2',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: '8faeb07f-7d0d-43fe-bc9f-64e55e4c91ac',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - old pal
        { 
          id: '13af7479-1f57-4823-84dd-0778020f86ee',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: '199629bf-1367-4be7-b942-541a8188ede0',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // janet - old pal
        { 
          id: 'b5188a3f-5ed1-4cc7-8b7c-7a355d553fa7',
          user_id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          business_id: '199629bf-1367-4be7-b942-541a8188ede0',
          role_type: process.env.CREATOR_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - the cure company
        { 
          id: '8d84fc5d-a262-4a54-8a86-118e7aac5102',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: 'e8728dd1-5ed5-4d6b-bc07-810aa79c8a5f',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - green dragon
        { 
          id: '70a6c1c4-23bb-4115-968e-fbde731bd78e',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: 'cd3b6f71-127c-4f08-bfa9-2478f09a4ff1',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - BARE
        { 
          id: 'cb3422c8-f2e8-46ca-85de-c5fda18f781f',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: '37de2ceb-0b11-47a3-bb43-9e0a6dadc789',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - deserts finest
        { 
          id: '0fc215bf-58b8-4a01-a24c-aea9fc0c5531',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: '7d416c48-e007-4eb1-9641-8b5ac54de5ff',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // janet - deserts finest
        { 
          id: 'e7f2ede5-eb23-421c-8916-ba77988029b2',
          user_id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          business_id: '7d416c48-e007-4eb1-9641-8b5ac54de5ff',
          role_type: process.env.MANAGER_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // seanone - no wait meds
        { 
          id: '58e1b805-7cd9-4e16-9d9f-ce217f9fc630',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: 'eac5ff8f-a9f9-430a-ab35-537686a5b0aa',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // janet - palm royal cannabis
        { 
          id: 'bf77bc0a-34d9-46bb-b5ca-b36c238e4636',
          user_id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          business_id: 'cf5bb409-85c9-43dc-acac-4d6444b1658f',
          role_type: process.env.MANAGER_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // sean - palm royal cannabis
        { 
          id: '6aee2ff0-7745-4f5a-a94b-f466651a4177',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: 'cf5bb409-85c9-43dc-acac-4d6444b1658f',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // janet - BARE
        { 
          id: '582a0d4b-dd63-48e2-b7e9-1ff2fd95c603',
          user_id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          business_id: '37de2ceb-0b11-47a3-bb43-9e0a6dadc789',
          role_type: process.env.CREATOR_ACCOUNT,
          active_role: false
        },
        // janet - west coast cure
        { 
          id: 'cdf39a48-6475-4db3-add6-063ddb6ed14a',
          user_id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          business_id: '8faeb07f-7d0d-43fe-bc9f-64e55e4c91ac',
          role_type: process.env.CREATOR_ACCOUNT,
          active_role: false
        },
        // seanone - brand new business
        { 
          id: '3768baf0-ee30-499a-a6d7-bf0626a35962',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: '31399650-c64c-4558-8e0e-f10b5382f474',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '2c906eeb-c7f7-4534-ae06-20f601b42224'
        },
        // hank - hanks grow
        {
          id: '0a1175a0-84f9-496c-8d98-f1204398f8e8',
          user_id: '7dfbf74b-418e-4ee2-a2d2-425a11b62337',
          business_id: '29bada5f-f362-4b25-8320-f01d580b6d27',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: '7dfbf74b-418e-4ee2-a2d2-425a11b62337'
        },
        // brad - brads lounge
        {
          id: 'fb202aaf-7ee5-44de-8e30-3670019a58a0',
          user_id: 'c0154ccc-3686-45d2-a598-5d375f0a1a25',
          business_id: 'af87fc85-f800-4868-bf52-43996b16d4f0',
          role_type: process.env.ADMIN_ACCOUNT,
          active_role: true,
          approved_by: 'c0154ccc-3686-45d2-a598-5d375f0a1a25'
        },
        // brad - hanks grow
        {
          id: '5e7acbac-c24d-421c-9d61-f0736642de64',
          user_id: 'c0154ccc-3686-45d2-a598-5d375f0a1a25',
          business_id: '29bada5f-f362-4b25-8320-f01d580b6d27',
          role_type: process.env.CREATOR_ACCOUNT,
          active_role: false,
          approved_by: null
        },
        // janet - hanks grow
        {
          id: '0ea408d3-88cf-4c4d-8689-61ac21ae6383',
          user_id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          business_id: '29bada5f-f362-4b25-8320-f01d580b6d27',
          role_type: process.env.CREATOR_ACCOUNT,
          active_role: true,
          approved_by: '7dfbf74b-418e-4ee2-a2d2-425a11b62337'
        },
        // seanone - hanks grow
        {
          id: '3bf6f6fd-7a26-4539-b7ec-afac810b0f72',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: '29bada5f-f362-4b25-8320-f01d580b6d27',
          role_type: process.env.MANAGER_ACCOUNT,
          active_role: true,
          approved_by: '7dfbf74b-418e-4ee2-a2d2-425a11b62337'
        },
        // seanone - brads lounge
        {
          id: 'dcc8a940-9a14-4b68-88e7-05de3bbdecbb',
          user_id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          business_id: 'af87fc85-f800-4868-bf52-43996b16d4f0',
          role_type: process.env.CREATOR_ACCOUNT,
          active_role: true,
          approved_by: 'c0154ccc-3686-45d2-a598-5d375f0a1a25'
        },
        
        ]);
    });
};
