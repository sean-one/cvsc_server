
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('events').del()
    .then(function () {
      // Inserts seed entries
      return knex('events').insert([
        {
          id: '65e4db99-8109-4bad-9378-6f1d39d6edab',
          eventname: 'great upcoming event',
          eventdate: '03/01/24',
          eventstart: 800,
          eventend: 1000,
          eventmedia: 'https://picsum.photos/id/1061/500',
          details: 'Sunt est anim nisi pariatur laborum ex nisi laborum nostrud. Qui sunt sit laborum excepteur. Ad consequat consectetur officia enim officia dolor exercitation velit. Proident nostrud mollit proident aute eiusmod commodo laborum ullamco laboris elit. Proident aliquip veniam tempor ea sint cupidatat culpa cupidatat voluptate do. Laboris eu adipisicing cillum est laborum nisi nisi commodo velit est nisi adipisicing. Id elit veniam amet occaecat duis dolor sit Lorem.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'a6b198d5-f18c-402c-a3e7-f739b9491a65',
          eventname: 'something fun to do',
          eventdate: '03/02/24',
          eventstart: 1400,
          eventend: 1600,
          eventmedia: 'https://picsum.photos/id/1059/500',
          details: 'Lorem sit minim veniam pariatur incididunt eiusmod nisi do. Cillum quis laborum sunt exercitation minim. Ut reprehenderit nulla commodo veniam dolore amet.',
          created_by: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
        },
        {
          id: 'ca83791a-b70b-4771-9d61-158a1aca2f52',
          eventname: 'smokers only party',
          eventdate: '03/02/24',
          eventstart: 1500,
          eventend: 1800,
          eventmedia: 'https://picsum.photos/id/1065/500',
          details: 'Cupidatat ullamco exercitation incididunt cillum pariatur proident non aliqua ea officia magna est dolor. Nostrud reprehenderit voluptate enim commodo. Ad laboris eiusmod cupidatat irure duis culpa velit ad dolore id enim fugiat minim. Laborum magna labore velit nostrud in ad cillum proident nisi eu irure sint.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'c10f4ccb-7a9f-45db-8015-31a9f2cdc23d',
          eventname: 'new product samples',
          eventdate: '03/03/24',
          eventstart: 1800,
          eventend: 2000,
          eventmedia: 'https://picsum.photos/id/1077/500',
          details: 'Pariatur adipisicing minim cupidatat sunt deserunt et dolor enim. Ipsum consequat dolore nostrud laboris. Dolor aliquip consectetur minim laborum elit. Dolor nisi ea ut consectetur laborum dolor cillum labore adipisicing quis nisi sit. Sunt aliqua labore exercitation aliquip. Id eiusmod dolore voluptate amet consequat laborum exercitation fugiat id culpa magna id pariatur aliquip. Pariatur ex elit eu proident consequat fugiat irure ea reprehenderit.',
          created_by: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
        },
        {
          id: '7dba2df9-b6a9-4a2c-9a11-46d85ffcb7c7',
          eventname: 'free dabs for everyone',
          eventdate: '03/04/24',
          eventstart: 1200,
          eventend: 1700,
          eventmedia: 'https://picsum.photos/id/108/500',
          details: 'In aute reprehenderit officia anim mollit ipsum aliqua id duis quis enim. Duis irure tempor est consequat esse irure officia sit ut. Ipsum aliqua nostrud velit dolore eiusmod deserunt velit non exercitation pariatur minim quis Lorem eiusmod.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'fa918cb4-1914-4352-b1cd-42fd31bfdb50',
          eventname: 'double the fun',
          eventdate: '03/04/24',
          eventstart: 2100,
          eventend: 2300,
          eventmedia: 'https://picsum.photos/id/117/500',
          details: 'Laborum ipsum in dolore voluptate enim dolor. Anim Lorem pariatur nostrud ut. Ex ex non reprehenderit pariatur sint irure cillum sunt esse ea. Dolor Lorem Lorem do dolor non duis.',
          created_by: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
        },
        {
          id: '9ab39eaa-22cf-468e-aeb9-5a1484af4fc4',
          eventname: 'buy one get one free',
          eventdate: '03/05/24',
          eventstart: 800,
          eventend: 1700,
          eventmedia: 'https://picsum.photos/id/129/500',
          details: 'Nisi fugiat aliquip aute id do. Excepteur reprehenderit minim adipisicing cillum quis consequat ea reprehenderit fugiat minim dolore minim ad. Cupidatat aliquip exercitation sint enim eu in nisi officia nulla id nisi quis. Ad anim sunt eu ex eiusmod nisi. In proident sunt consectetur cupidatat cillum aute est veniam excepteur labore. Lorem nisi nostrud exercitation nulla occaecat. Lorem est cillum aute sit et consequat commodo voluptate mollit adipisicing minim amet exercitation.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'b90e1553-6c47-4cee-a179-750bcf637581',
          eventname: 'smokers blow out',
          eventdate: '03/06/24',
          eventstart: 1200,
          eventend: 1500,
          eventmedia: 'https://picsum.photos/id/152/500',
          details: 'Sint sunt mollit dolore cupidatat proident ad. Eiusmod dolore nostrud in irure laborum do tempor amet. Occaecat excepteur enim culpa pariatur occaecat et ullamco minim dolor aute id duis. Ullamco adipisicing esse est labore duis pariatur quis cupidatat excepteur voluptate reprehenderit sit culpa consequat.',
          created_by: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
        },
        {
          id: '064b844d-511d-4ded-9831-f299066d799a',
          eventname: 'pre rollers only',
          eventdate: '03/07/24',
          eventstart: 1400,
          eventend: 1600,
          eventmedia: 'https://picsum.photos/id/158/500',
          details: 'Magna proident occaecat labore id culpa occaecat nulla id exercitation ex Lorem. Laborum laboris eu commodo ea qui dolore. Non aliquip fugiat elit excepteur aliquip dolore ipsum sunt sit deserunt. Labore qui consequat esse exercitation ipsum commodo qui in eiusmod dolore anim do ad. Fugiat cupidatat consectetur adipisicing exercitation quis ipsum ea enim nostrud ullamco et mollit. Aliqua Lorem quis consequat esse exercitation. Do ut esse aute enim aliqua excepteur proident aliqua eu qui.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'c66ff4d7-b219-4da7-9b70-56aceb55d5e4',
          eventname: 'new strain release',
          eventdate: '03/04/24',
          eventstart: 1600,
          eventend: 2200,
          eventmedia: 'https://picsum.photos/id/174/500',
          details: 'Magna labore laboris fugiat cillum ut aliqua tempor aliquip veniam enim consequat labore in elit. Ipsum labore sunt incididunt deserunt quis excepteur ullamco ipsum. Consequat aliquip elit occaecat nisi fugiat exercitation mollit culpa dolor cupidatat id ea culpa. Sint laborum sint tempor anim in elit velit consectetur veniam commodo enim sunt. Proident fugiat duis magna tempor cupidatat id dolor Lorem. Incididunt cupidatat enim pariatur in amet labore ea incididunt dolor. Lorem consequat et consequat tempor occaecat enim ut deserunt reprehenderit excepteur.',
          created_by: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
        },
        {
          id: '200418ab-432a-4094-b698-be5cfe0e789a',
          eventname: 'big party day',
          eventdate: '03/08/24',
          eventstart: 800,
          eventend: 1000,
          eventmedia: 'https://picsum.photos/id/180/500',
          details: 'Labore cillum amet velit sint et. Sunt culpa culpa ullamco magna non eu. Adipisicing nulla eiusmod nostrud culpa amet. Minim veniam ex Lorem eiusmod officia nostrud commodo minim enim magna veniam excepteur exercitation do. Voluptate sit esse magna fugiat sunt ullamco qui est elit dolor deserunt duis dolor aliquip.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'ab674d3a-f464-4468-8d56-aced79dbd54c',
          eventname: 'the meet and greet with a really really long name',
          eventdate: '03/08/24',
          eventstart: 1900,
          eventend: 2100,
          eventmedia: 'https://picsum.photos/id/192/500',
          details: 'Pariatur non consequat ut enim nisi ad incididunt proident occaecat velit sit. Exercitation ea aliqua deserunt incididunt mollit reprehenderit sint reprehenderit est ad culpa deserunt culpa ut. Aliquip nisi dolor aliqua ipsum. Laboris tempor duis non minim enim enim magna do fugiat sint ut. Ullamco enim id est aliqua cillum consequat dolor veniam ut aliqua ipsum cillum incididunt dolor. Minim sunt esse occaecat minim. Eu reprehenderit excepteur ex velit dolore minim voluptate esse eiusmod magna.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '6e2849ac-d814-4ca4-973b-280b877b16e6',
          eventname: 'mean green machine',
          eventdate: '03/08/24',
          eventstart: 1100,
          eventend: 1300,
          eventmedia: 'https://picsum.photos/id/209/500',
          details: 'Mollit occaecat cupidatat cupidatat deserunt. Aute laboris eiusmod ullamco tempor veniam ipsum. Ex qui labore dolor occaecat ad. Ea officia dolore nostrud proident enim anim officia commodo nulla nulla officia.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '4a686c54-a020-4c1f-8ed8-11308dc703e5',
          eventname: 'big day finale',
          eventdate: '03/08/24',
          eventstart: 2100,
          eventend: 2300,
          eventmedia: 'https://picsum.photos/id/249/500',
          details: 'Non non sint reprehenderit mollit. Cillum et elit non labore do aute nisi occaecat mollit officia ipsum eiusmod pariatur. Laborum sint tempor labore elit quis irure aliquip enim voluptate.',
          created_by: '218e312c-e67c-497e-9c3a-f69abf28f2bc',
        },
        {
          id: '9a1fbcbe-9a0c-4406-9f80-d9108f4d3a54',
          eventname: 'stiiizy at brads lounge',
          eventdate: '03/09/24',
          eventstart: 2100,
          eventend: 2300,
          eventmedia: 'https://picsum.photos/id/269/500',
          details: 'Non non sint reprehenderit mollit. Cillum et elit non labore do aute nisi occaecat mollit officia ipsum eiusmod pariatur. Laborum sint tempor labore elit quis irure aliquip enim voluptate.',
          created_by: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        }
      ]);
    });
};
