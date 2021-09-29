
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { username: 'seanone', email: 'basement365@gmail.com', avatar: 'https://lh3.googleusercontent.com/ogw/ADea4I6XMQvy_ktdaZZ7d4pNZNwbhrCoA1SAvvaB8Mi1QA=s32-c-mo', password: '$2a$14$tswDPo02q2gg/DcwH11e3.C2sziAWdSjnBeL35bQ9L36qdWeadM9e', isAdmin: true, accounttype: 'editor' },
        { username: 'janet', email: 'jlopez760@aol.com', avatar: 'https://picsum.photos/100/100', password: '$2a$14$3HABR4cxzl.uP/.QosYes.Kkjnj72g9eR1Z7wkQ2413rQ8btNaZjC', isAdmin: true, accounttype: 'editor' }
      ]);
    });
};
