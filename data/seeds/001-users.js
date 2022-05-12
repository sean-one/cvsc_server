
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { 
          id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          username: 'seanone',
          avatar: 'https://coachellavalleysmokers-images.s3.amazonaws.com/23988.jpeg',
          password: '$2a$14$tswDPo02q2gg/DcwH11e3.C2sziAWdSjnBeL35bQ9L36qdWeadM9e',
          account_type: 'admin',
          email: 'basement365@gmail.com',
        },
        { 
          id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          username: 'janet',
          avatar: "https://coachellavalleysmokers-images.s3.amazonaws.com/default_user_icon.png",
          password: '$2a$14$3HABR4cxzl.uP/.QosYes.Kkjnj72g9eR1Z7wkQ2413rQ8btNaZjC',
          account_type: 'manager',
          email: 'jlopez760@gmail.com',
        }
      ]);
    });
};
