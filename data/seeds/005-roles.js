
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('roles').del()
    .then(function () {
      // Inserts seed entries
      return knex('roles').insert([
        { user_id: 1, business_id: 1 },
        { user_id: 2, business_id: 2 },
        { user_id: 1, business_id: 3 },
        { user_id: 2, business_id: 4 },
        { user_id: 1, business_id: 5 },
        { user_id: 2, business_id: 6 },
        { user_id: 1, business_id: 7 },
        { user_id: 2, business_id: 8 },
        { user_id: 1, business_id: 9 }
      ]);
    });
};
