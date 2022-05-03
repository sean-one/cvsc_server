
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { id: '2c906eeb-c7f7-4534-ae06-20f601b42224', username: 'seanone', avatar: 'https://coachellavalleysmokers-images.s3.amazonaws.com/23988.jpeg', password: '$2a$14$tswDPo02q2gg/DcwH11e3.C2sziAWdSjnBeL35bQ9L36qdWeadM9e', contact_id: 'fb3920f8-e659-49b3-81ee-a8d1ebe7de2c', account_type: 'admin' },
        { id: '218e312c-e67c-497e-9c3a-f69abf28f2bc', username: 'janet', avatar: "https://coachellavalleysmokers-images.s3.amazonaws.com/default_user_icon.png", password: '$2a$14$3HABR4cxzl.uP/.QosYes.Kkjnj72g9eR1Z7wkQ2413rQ8btNaZjC', contact_id: '52597011-6f7d-483f-ab83-62520ee91688', account_type: 'manager' }
      ]);
    });
};
