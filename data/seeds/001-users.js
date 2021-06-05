
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { id: 1, username: 'seanone', email: 'basement365@gmail.com', avatar: 'https://picsum.photos/100/100', password: '$2a$14$tswDPo02q2gg/DcwH11e3.C2sziAWdSjnBeL35bQ9L36qdWeadM9e'},
        { id: 2, username: 'janet', email: 'jlopez760@aol.com', avatar: 'https://picsum.photos/100/100', password: '$2a$14$3HABR4cxzl.uP/.QosYes.Kkjnj72g9eR1Z7wkQ2413rQ8btNaZjC'}
      ]);
    });
};
