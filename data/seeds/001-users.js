
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
          password: '$2a$14$nNMiO8eWG.rgnK/NSN11HOsZoEveTC9M/8HGXQxrgbJCEJ9WPiXQu',
          email: 'ackerman.sean.w@gmail.com',
        },
        { 
          id: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
          username: 'janet',
          password: '$2a$14$j2lkkWMP0ubREWksGILzq.nKXd89unQd54gB9lSH8V6MSPSVYI0EG',
          email: 'jlopez760@gmail.com',
        },
        {
          id: '7dfbf74b-418e-4ee2-a2d2-425a11b62337',
          username: 'hank',
          password: '$2a$14$Y0dmaHsYuWAEabylI4KgRegPagkfvkaW.ykVhRukPbTZDvAACt/I2',
          email: 'hankster@gmail.com',
        },
        {
          id: 'c0154ccc-3686-45d2-a598-5d375f0a1a25',
          username: 'brad',
          password: '$2a$14$BZzGgGZbMpxuxrqIggfmVeFfSYszjJ/qgf0wpN9vtt1ru8G9CYfSu',
          email: 'bradly@gmail.com',
        },
        {
          id: '33bd70f3-d480-465c-8a62-eae20aebccd0',
          username: 'jon',
          password: '$2a$14$ezM9og/dJqj8IRtpxDom/uAMeTz2T2qBhQmxrQDkvYCPvrslS5mse',
          email: 'jonjon@gmail.com',
        }
      ]);
    });
};
