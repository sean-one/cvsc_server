
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { 
          id: '2c906eeb-c7f7-4534-ae06-20f601b42224',
          username: 'seanone',
          avatar: '23988.jpeg',
          password: '$2a$14$tswDPo02q2gg/DcwH11e3.C2sziAWdSjnBeL35bQ9L36qdWeadM9e',
          email: 'ackerman.sean.w@gmail.com',
        },
        { 
          id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          username: 'janet',
          password: '$2a$14$3HABR4cxzl.uP/.QosYes.Kkjnj72g9eR1Z7wkQ2413rQ8btNaZjC',
          email: 'jlopez760@gmail.com',
        },
        {
          id: '7dfbf74b-418e-4ee2-a2d2-425a11b62337',
          username: 'hank',
          password: '$2a$14$n1hQOL7kh7LZaXqG57lvTOtF5aY8idipE7bU12DS5ZTRqky7B0P96',
          email: 'hankster@gmail.com',
        },
        {
          id: 'c0154ccc-3686-45d2-a598-5d375f0a1a25',
          username: 'brad',
          password: '$2a$14$3r6IwxFXeJ3BPIdh3zzD7eCbR6N6IHsKOPV1NOeX619H4jaxLpVeq',
          email: 'bradly@gmail.com',
        },
        {
          id: '33bd70f3-d480-465c-8a62-eae20aebccd0',
          username: 'jon',
          password: '$2a$14$.K2mvTgMuvjOlJPh4d.4OO331Pwhn1K/Js822P3fkIrHPCBQtoUDC',
          email: 'jonjon@gmail.com',
        }
      ]);
    });
};
