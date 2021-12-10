
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('contacts').del()
    .then(function () {
      // Inserts seed entries
      return knex('contacts').insert([
        { email: 'basement365@gmail.com'},
        { email: 'jlopez760@gmail.com', instagram: 'janetInsta'},
      ]);
    });
};
