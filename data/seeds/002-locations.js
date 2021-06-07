
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('locations').del()
    .then(function () {
      // Inserts seed entries
      return knex('locations').insert([
        {
          venue_name: "Green Dragon",
          street: "353 South Palm Canyon Drive",
          city: "Palm Springs",
          state: "CA",
          zipcode: "92262",
          formatted: "353 S Palm Canyon Dr, Palm Springs, CA 92262, USA",
          place_id: "EjEzNTMgUyBQYWxtIENhbnlvbiBEciwgUGFsbSBTcHJpbmdzLCBDQSA5MjI2MiwgVVNBIhsSGQoUChIJH2RTUqYb24ARJ6fbb5cp5jgQ4QI"
        },
        {
          venue_name: "BARE Dispensary",
          street: "690 Garnet Avenue",
          city: "Palm Springs",
          state: "CA",
          zipcode: "92262",
          formatted: "690 Garnet Ave, Palm Springs, CA 92262, USA",
          place_id: "ChIJdWLItvsY24ARW4eKd066M2A"
        },
        {
          venue_name: "Desert's Finest",
          street: "12106 Palm Drive",
          city: "Desert Hot Springs",
          state: "CA",
          zipcode: "92240",
          formatted: "12106 Palm Dr, Desert Hot Springs, CA 92240, USA",
          place_id: "ChIJdWEAWeUh24ARxjQrMNew_A0"
        },
        {
          venue_name: "No Wait Meds",
          street: "68860 Ramon Road #2",
          city: "Cathedral City",
          state: "CA",
          zipcode: "92234",
          formatted: "68860 Ramon Rd #2, Cathedral City, CA 92234, USA",
          place_id: "EjA2ODg2MCBSYW1vbiBSZCAjMiwgQ2F0aGVkcmFsIENpdHksIENBIDkyMjM0LCBVU0EiHRobChYKFAoSCc_S_8gYHduAET0OmgvPYae9EgEy"
        },
        {
          venue_name: "Palm Royal Cannabis",
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
