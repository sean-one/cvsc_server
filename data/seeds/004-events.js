
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        {
          eventname: 'great upcoming event',
          eventdate: '02/17/22',
          eventstart: 800,
          eventend: 1000,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 5,
          details: 'Sunt est anim nisi pariatur laborum ex nisi laborum nostrud. Qui sunt sit laborum excepteur. Ad consequat consectetur officia enim officia dolor exercitation velit. Proident nostrud mollit proident aute eiusmod commodo laborum ullamco laboris elit. Proident aliquip veniam tempor ea sint cupidatat culpa cupidatat voluptate do. Laboris eu adipisicing cillum est laborum nisi nisi commodo velit est nisi adipisicing. Id elit veniam amet occaecat duis dolor sit Lorem.',
          brand_id: 5,
          created_by: 1
        },
        {
          eventname: 'something fun to do',
          eventdate: '02/18/22',
          eventstart: 1400,
          eventend: 1600,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 9,
          details: 'Lorem sit minim veniam pariatur incididunt eiusmod nisi do. Cillum quis laborum sunt exercitation minim. Ut reprehenderit nulla commodo veniam dolore amet.',
          brand_id: 4,
          created_by: 2
        },
        {
          eventname: 'smokers only party',
          eventdate: '02/18/22',
          eventstart: 1500,
          eventend: 1800,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 8,
          details: 'Cupidatat ullamco exercitation incididunt cillum pariatur proident non aliqua ea officia magna est dolor. Nostrud reprehenderit voluptate enim commodo. Ad laboris eiusmod cupidatat irure duis culpa velit ad dolore id enim fugiat minim. Laborum magna labore velit nostrud in ad cillum proident nisi eu irure sint.',
          brand_id: 3,
          created_by: 1
        },
        {
          eventname: 'new product samples',
          eventdate: '02/19/22',
          eventstart: 1800,
          eventend: 2000,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 7,
          details: 'Pariatur adipisicing minim cupidatat sunt deserunt et dolor enim. Ipsum consequat dolore nostrud laboris. Dolor aliquip consectetur minim laborum elit. Dolor nisi ea ut consectetur laborum dolor cillum labore adipisicing quis nisi sit. Sunt aliqua labore exercitation aliquip. Id eiusmod dolore voluptate amet consequat laborum exercitation fugiat id culpa magna id pariatur aliquip. Pariatur ex elit eu proident consequat fugiat irure ea reprehenderit.',
          brand_id: 2,
          created_by: 2
        },
        {
          eventname: 'free dabs for everyone',
          eventdate: '02/20/22',
          eventstart: 1200,
          eventend: 1700,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 6,
          details: 'In aute reprehenderit officia anim mollit ipsum aliqua id duis quis enim. Duis irure tempor est consequat esse irure officia sit ut. Ipsum aliqua nostrud velit dolore eiusmod deserunt velit non exercitation pariatur minim quis Lorem eiusmod.',
          brand_id: 1,
          created_by: 1
        },
        {
          eventname: 'double the fun',
          eventdate: '02/20/22',
          eventstart: 2100,
          eventend: 2300,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 5,
          details: 'Laborum ipsum in dolore voluptate enim dolor. Anim Lorem pariatur nostrud ut. Ex ex non reprehenderit pariatur sint irure cillum sunt esse ea. Dolor Lorem Lorem do dolor non duis.',
          brand_id: 5,
          created_by: 2
        },
        {
          eventname: 'buy one get one free',
          eventdate: '02/21/22',
          eventstart: 800,
          eventend: 1700,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 7,
          details: 'Nisi fugiat aliquip aute id do. Excepteur reprehenderit minim adipisicing cillum quis consequat ea reprehenderit fugiat minim dolore minim ad. Cupidatat aliquip exercitation sint enim eu in nisi officia nulla id nisi quis. Ad anim sunt eu ex eiusmod nisi. In proident sunt consectetur cupidatat cillum aute est veniam excepteur labore. Lorem nisi nostrud exercitation nulla occaecat. Lorem est cillum aute sit et consequat commodo voluptate mollit adipisicing minim amet exercitation.',
          brand_id: 4,
          created_by: 1
        },
        {
          eventname: 'smokers blow out',
          eventdate: '02/22/22',
          eventstart: 1200,
          eventend: 1500,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 7,
          details: 'Sint sunt mollit dolore cupidatat proident ad. Eiusmod dolore nostrud in irure laborum do tempor amet. Occaecat excepteur enim culpa pariatur occaecat et ullamco minim dolor aute id duis. Ullamco adipisicing esse est labore duis pariatur quis cupidatat excepteur voluptate reprehenderit sit culpa consequat.',
          brand_id: 3,
          created_by: 2
        },
        {
          eventname: 'pre rollers only',
          eventdate: '02/23/22',
          eventstart: 1400,
          eventend: 1600,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 6,
          details: 'Magna proident occaecat labore id culpa occaecat nulla id exercitation ex Lorem. Laborum laboris eu commodo ea qui dolore. Non aliquip fugiat elit excepteur aliquip dolore ipsum sunt sit deserunt. Labore qui consequat esse exercitation ipsum commodo qui in eiusmod dolore anim do ad. Fugiat cupidatat consectetur adipisicing exercitation quis ipsum ea enim nostrud ullamco et mollit. Aliqua Lorem quis consequat esse exercitation. Do ut esse aute enim aliqua excepteur proident aliqua eu qui.',
          brand_id: 2,
          created_by: 1
        },
        {
          eventname: 'new strain release',
          eventdate: '02/20/22',
          eventstart: 1600,
          eventend: 2200,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 6,
          details: 'Magna labore laboris fugiat cillum ut aliqua tempor aliquip veniam enim consequat labore in elit. Ipsum labore sunt incididunt deserunt quis excepteur ullamco ipsum. Consequat aliquip elit occaecat nisi fugiat exercitation mollit culpa dolor cupidatat id ea culpa. Sint laborum sint tempor anim in elit velit consectetur veniam commodo enim sunt. Proident fugiat duis magna tempor cupidatat id dolor Lorem. Incididunt cupidatat enim pariatur in amet labore ea incididunt dolor. Lorem consequat et consequat tempor occaecat enim ut deserunt reprehenderit excepteur.',
          brand_id: 5,
          created_by: 2
        },
        {
          eventname: 'big party day',
          eventdate: '02/24/22',
          eventstart: 800,
          eventend: 1000,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 6,
          details: 'Labore cillum amet velit sint et. Sunt culpa culpa ullamco magna non eu. Adipisicing nulla eiusmod nostrud culpa amet. Minim veniam ex Lorem eiusmod officia nostrud commodo minim enim magna veniam excepteur exercitation do. Voluptate sit esse magna fugiat sunt ullamco qui est elit dolor deserunt duis dolor aliquip.',
          brand_id: 5,
          created_by: 1
        },
        {
          eventname: 'the meet and greet with a really really long name',
          eventdate: '02/24/22',
          eventstart: 1900,
          eventend: 2100,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 8,
          details: 'Pariatur non consequat ut enim nisi ad incididunt proident occaecat velit sit. Exercitation ea aliqua deserunt incididunt mollit reprehenderit sint reprehenderit est ad culpa deserunt culpa ut. Aliquip nisi dolor aliqua ipsum. Laboris tempor duis non minim enim enim magna do fugiat sint ut. Ullamco enim id est aliqua cillum consequat dolor veniam ut aliqua ipsum cillum incididunt dolor. Minim sunt esse occaecat minim. Eu reprehenderit excepteur ex velit dolore minim voluptate esse eiusmod magna.',
          brand_id: 4,
          created_by: 2
        },
        {
          eventname: 'mean green machine',
          eventdate: '02/24/22',
          eventstart: 1100,
          eventend: 1300,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 9,
          details: 'Mollit occaecat cupidatat cupidatat deserunt. Aute laboris eiusmod ullamco tempor veniam ipsum. Ex qui labore dolor occaecat ad. Ea officia dolore nostrud proident enim anim officia commodo nulla nulla officia.',
          brand_id: 3,
          created_by: 1
        },
        {
          eventname: 'big day finale',
          eventdate: '02/24/22',
          eventstart: 2100,
          eventend: 2300,
          eventmedia: 'https://picsum.photos/300/300',
          venue_id: 9,
          details: 'Non non sint reprehenderit mollit. Cillum et elit non labore do aute nisi occaecat mollit officia ipsum eiusmod pariatur. Laborum sint tempor labore elit quis irure aliquip enim voluptate.',
          brand_id: 2,
          created_by: 2
        }
      ]);
    });
};
