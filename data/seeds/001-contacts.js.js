
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('contacts').del()
    .then(function () {
      // Inserts seed entries
      return knex('contacts').insert([
        { id: 'fb3920f8-e659-49b3-81ee-a8d1ebe7de2c', email: 'basement365@gmail.com', facebook: 'seanackerman-facebook' },
        { id: '52597011-6f7d-483f-ab83-62520ee91688', email: 'jlopez760@gmail.com', instagram: 'janetInsta' },
        { id: '4abe4c48-43ec-4b72-9c93-e4bc8ad2a60c', email: 'stiiizy@gmail.com', instagram: 'stiiizy', facebook: 'stiiizy-facebook' },
        { id: 'c75491ff-4649-44d8-84f8-c239a3721b36', email: 'wcc@gmail.com', instagram: 'west_coast_cure', website: 'https://www.wcc.com' },
        { id: 'ee30e011-ae16-475a-b7ef-ce0f6bb56e80', email: 'oldPal@gmail.com', instagram: 'oldpal', facebook: 'oldpal-facebook' },
        { id: 'eae1f80c-15b8-4dfd-a3be-f2dcc06a3ee6', email: 'cureco@gmail.com', instagram: 'cure_company', facebook: 'cure-facebook' },
        { id: 'f773e6af-3c08-42d1-9c02-041bde27d3b2', email: 'greendragon@gmail.com', instagram: 'green_dragon', website: 'https://www.greendragon.com' },
        { id: '23830159-c2fe-43f7-a1aa-e5d5efaafa3c', email: 'Bare@gmail.com', instagram: 'bare420' },
        { id: 'ab7aa00a-bdf2-46cd-bdc0-d749ee407fd2', email: 'dFinest@gmail.com', instagram: 'deserts_finest', facebook: 'deserts_finest-facebook' },
        { id: 'b8341461-a650-48eb-8090-1a7b1396cba5', email: 'nowaiting@gmail.com', instagram: 'no_wait_meds', website: 'https://www.nowaitmeds.com' },
        { id: 'f4ad7304-3472-4019-8927-7d8520bf7c57', email: 'PRC@gmail.com', instagram: 'palm_royal', website: 'https://www.palmroyalcannabis.com', facebook: 'palmroyal-facebook' },
        { id: '5631d330-34cf-49f2-a6d8-604f450fb597', email: 'somethingnew@gmail.com', instagram: 'something_new' }
      ]);
    });
};
