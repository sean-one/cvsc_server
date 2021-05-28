
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { id: 1, username: 'seanone', email: 'basement365@gmail.com', avatar: 'https://picsum.photos/100/100', password: 'password'}
      ]);
    });
};
