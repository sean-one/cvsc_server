
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('contacts').del()
    .then(function () {
      // Inserts seed entries
      return knex('contacts').insert([
        {id: 1, email: 'basement365@gmail.com'},
        {id: 2, email: 'jlopez760@gmail.com'},
      ]);
    });
};
