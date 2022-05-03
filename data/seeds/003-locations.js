
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('locations').del()
    .then(function () {
      // Inserts seed entries
      return knex('locations').insert([
        {
          id: '22587096-0135-48ad-9ee0-812c44c56871',
          venue_name: "Green Dragon",
          venue_id: 'cd3b6f71-127c-4f08-bfa9-2478f09a4ff1',
          street: "353 South Palm Canyon Drive",
          city: "Palm Springs",
          state: "CA",
          zipcode: "92262",
          formatted: "353 S Palm Canyon Dr, Palm Springs, CA 92262, USA",
          place_id: "EjEzNTMgUyBQYWxtIENhbnlvbiBEciwgUGFsbSBTcHJpbmdzLCBDQSA5MjI2MiwgVVNBIhsSGQoUChIJH2RTUqYb24ARJ6fbb5cp5jgQ4QI"
        },
        {
          id: 'c431f06f-2c22-4bf6-83f3-708194043fae',
          venue_name: "BARE Dispensary",
          venue_id: '37de2ceb-0b11-47a3-bb43-9e0a6dadc789',
          street: "690 Garnet Avenue",
          city: "Palm Springs",
          state: "CA",
          zipcode: "92262",
          formatted: "690 Garnet Ave, Palm Springs, CA 92262, USA",
          place_id: "ChIJdWLItvsY24ARW4eKd066M2A"
        },
        {
          id: '14a78ff8-f55e-4bd5-8fca-cbb4f24ced6b',
          venue_name: "Desert's Finest",
          venue_id: '7d416c48-e007-4eb1-9641-8b5ac54de5ff',
          street: "12106 Palm Drive",
          city: "Desert Hot Springs",
          state: "CA",
          zipcode: "92240",
          formatted: "12106 Palm Dr, Desert Hot Springs, CA 92240, USA",
          place_id: "ChIJdWEAWeUh24ARxjQrMNew_A0"
        },
        {
          id: '49cca14e-d8a8-4bf3-94c4-f1e130337f0d',
          venue_name: "No Wait Meds",
          venue_id: 'eac5ff8f-a9f9-430a-ab35-537686a5b0aa',
          street: "68860 Ramon Road #2",
          city: "Cathedral City",
          state: "CA",
          zipcode: "92234",
          formatted: "68860 Ramon Rd #2, Cathedral City, CA 92234, USA",
          place_id: "EjA2ODg2MCBSYW1vbiBSZCAjMiwgQ2F0aGVkcmFsIENpdHksIENBIDkyMjM0LCBVU0EiHRobChYKFAoSCc_S_8gYHduAET0OmgvPYae9EgEy"
        },
        {
          id: '66331d04-ea4e-4874-bf48-f959cd3e5d84',
          venue_name: "Palm Royal Cannabis",
          venue_id: 'cf5bb409-85c9-43dc-acac-4d6444b1658f',
          street: "75048 Gerald Ford Drive #101",
          city: "Palm Desert",
          state: "CA",
          zipcode: "92211",
          formatted: "75048 Gerald Ford Dr #101, Palm Desert, CA 92211, USA",
          place_id: "ChIJg0Uo_PP82oARobd0smOx-M8"
        }
      ]);
    });
};
