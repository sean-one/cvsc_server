
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('contacts').del()
    .then(function () {
      // Inserts seed entries
      return knex('contacts').insert([
        { email: 'basement365@gmail.com', facebook: 'seanackerman-facebook' },
        { email: 'jlopez760@gmail.com', instagram: 'janetInsta' },
        { email: 'stiiizy@gmail.com', instagram: 'stiiizy', facebook: 'stiiizy-facebook' },
        { email: 'wcc@gmail.com', instagram: 'west_coast_cure', website: 'https://www.wcc.com' },
        { email: 'oldPal@gmail.com', instagram: 'oldpal', facebook: 'oldpal-facebook' },
        { email: 'cureco@gmail.com', instagram: 'cure_company', facebook: 'cure-facebook' },
        { email: 'greendragon@gmail.com', instagram: 'green_dragon', website: 'https://www.greendragon.com' },
        { email: 'Bare@gmail.com', instagram: 'bare420' },
        { email: 'dFinest@gmail.com', instagram: 'deserts_finest', facebook: 'deserts_finest-facebook' },
        { email: 'nowaiting@gmail.com', instagram: 'no_wait_meds', website: 'https://www.nowaitmeds.com' },
        { email: 'PRC@gmail.com', instagram: 'palm_royal', website: 'https://www.palmroyalcannabis.com', facebook: 'palmroyal-facebook' },
        { email: 'somethingnew@gmail.com', instagram: 'something_new' }
      ]);
    });
};
