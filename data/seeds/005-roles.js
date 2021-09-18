
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('roles').del()
    .then(function () {
      // Inserts seed entries
      return knex('roles').insert([
        { user_id: 1, business_id: 1, roletype: 'admin' },
        { user_id: 2, business_id: 1, roletype: 'creator' },
        { user_id: 2, business_id: 2, roletype: 'admin' },
        { user_id: 1, business_id: 2, roletype: 'creator' },
        { user_id: 1, business_id: 3, roletype: 'admin' },
        { user_id: 2, business_id: 3, roletype: 'creator' },
        { user_id: 2, business_id: 4, roletype: 'admin' },
        { user_id: 1, business_id: 4, roletype: 'creator' },
        { user_id: 1, business_id: 5, roletype: 'admin' },
        { user_id: 2, business_id: 5, roletype: 'creator' },
        { user_id: 2, business_id: 6, roletype: 'admin' },
        { user_id: 1, business_id: 6, roletype: 'creator' },
        { user_id: 1, business_id: 7, roletype: 'admin' },
        { user_id: 2, business_id: 7, roletype: 'creator' },
        { user_id: 2, business_id: 8, roletype: 'admin' },
        { user_id: 1, business_id: 8, roletype: 'creator' },
        { user_id: 1, business_id: 9, roletype: 'admin' },
        { user_id: 2, business_id: 9, roletype: 'creator' }
      ]);
    });
};
