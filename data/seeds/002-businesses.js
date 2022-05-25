
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('businesses').del()
    .then(function () {
      // Inserts seed entries
      return knex('businesses').insert([
        {
          id: 'b09f358c-6926-47bb-b8fc-20788b92ae16',
          business_name: "STIIIZY",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "STIIIZY is known as an innovative, award-winning, California-based cannabis brand. Founded in 2017 as a pioneering vape company, STIIIZY evolved into so much more. Today, STIIIZY has become one of the world's most treasured cannabis brands with its class defining retail stores and amazing cannabis products. Always innovating, always inspiring, always influencing: that's us. Let's take it to new heights.",
          business_email: 'stiiizy@gmail.com',
          business_instagram: 'stiiizy',
          business_facebook: 'stiiizy-facebook',
          business_phone: 7608675309,
          business_type: "brand",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '8faeb07f-7d0d-43fe-bc9f-64e55e4c91ac',
          business_name: "West Coast Cure",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "West Coast Cure brings years of connoisseur cannabis mastery to the table, effortlessly offering consumers the best marijuana experience. With an award-winning pedigree and that extra something special, West Coast Cure is the go-to cannabis label for the true connoisseur. It’s not something West Coast Cure works at; they simply have a Passion for Cannabis.",
          business_email: 'wcc@gmail.com',
          business_instagram: 'west_coast_cure',
          business_website: 'https://www.wcc.com',
          business_type: "brand",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '199629bf-1367-4be7-b942-541a8188ede0',
          business_name: "Old Pal",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "Accessible, affordable, and abundant, Old Pal’s vision is simple: It’s just weed, y'all. Neighbor grown and meant to be shared, our cannabis is all natural, sun-kissed, and rain-watered. Available in three simple varieties: Indica, Sativa, and Hybrid - this is weed for the people. Old Pal is an ode to simpler times, when weed was just weed and joints were passed around to old pals and new ones. When neighbors knew each other by name and community meant something. So grab a bag of Old Pal and pass it around. It’s time we took care of each other.Old Pal is currently available in California, Nevada, and Oklahoma.",
          business_email: 'oldPal@gmail.com',
          business_instagram: 'oldpal',
          business_facebook: 'oldpal-facebook',
          business_type: "brand",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'e8728dd1-5ed5-4d6b-bc07-810aa79c8a5f',
          business_name: "The Cure Company",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "Licensed to produce quality cannabis products. Clean, organic, and single sourced. The Cure Company is Los Angeles source to the most exceptional cannabis flowers, concentrates, and edibles. The Cure Company group is proud to supply cannabis products Southern Californians can rely upon, safe and lab tested.",
          business_email: 'cureco@gmail.com',
          business_instagram: 'cure_company',
          business_facebook: 'cure-facebook',
          business_type: "brand",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'cd3b6f71-127c-4f08-bfa9-2478f09a4ff1',
          business_name: "Green Dragon",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "Green Dragon Farms offers a myriad of strain varieties derived from the healthiest and most stable mother plants. Folks can’t get enough of their San Fernando Valley OG clones or flowers. This phenotype of OG Kush provides a large yield with buds blanketed in trichomes. Find the strain you love and bring those buds to life with Green Dragon Farms.",
          business_email: 'greendragon@gmail.com',
          business_instagram: 'green_dragon',
          business_website: 'https://www.greendragon.com',
          business_type: "both",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '37de2ceb-0b11-47a3-bb43-9e0a6dadc789',
          business_name: "BARE Dispensary",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "At Bare Dispensary, we take pride in providing the best prices for a vast selection of high quality cannabis products for our customers within a comfortable, clean, and professional environment. Our bud-tenders are knowledgeable and can provide recommendations for the specific needs of both medical patients as well as recreational consumers. Every person is different, which is why we offer a wide variety of options on everything from flower, vapes, and concentrates, to tinctures, topicals, and CBD products.",
          business_email: 'Bare@gmail.com',
          business_instagram: 'bare420',
          business_type: "both",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '7d416c48-e007-4eb1-9641-8b5ac54de5ff',
          business_name: "Desert's Finest",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "We are one of the top recreational cannabis dispensaries in the Coachella Valley, and are proud to serve people from Desert Hot Springs, Palm Springs, Yucca Valley, Joshua Tree, and beyond! Our beautiful, desert-inspired boutique-style marijuana dispensary welcomes everyone 21 and holds a large variety of strains, vapes, edibles, transdermal balms, tinctures, and much more! We are proud to carry the top-of-the-line CBD products from Papa & Barkley, Mary's Medicinals, CBD Living amazing THC products from Los Angeles Kush, CRU Cannabis, and Cookies (just to name a few!) We take CASH & CREDIT/DEBIT, ATM available at your convenience.",
          business_email: 'dFinest@gmail.com',
          business_instagram: 'deserts_finest',
          business_facebook: 'deserts_finest-facebook',
          business_type: "venue",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'eac5ff8f-a9f9-430a-ab35-537686a5b0aa',
          business_name: "No Wait Meds",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "Here at No Wait Meds, we are excited to serve you with premium quality product, at the lowest prices the valley has to offer. Our hand picked team of bud tenders is dedicated to you and your experience. We value your time and convenience so we can help you spend less time waiting, and more time enjoying.",
          business_email: 'nowaiting@gmail.com',
          business_instagram: 'no_wait_meds',
          business_website: 'https://www.nowaitmeds.com',
          business_type: "venue",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: 'cf5bb409-85c9-43dc-acac-4d6444b1658f',
          business_name: "Palm Royal Cannabis",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "It's simple, we believe in the cause and we want to help our customers/patients find the right products that best suit their needs. We live in a very exciting time, and here at Palm Royale we want to help educate and show the true beauty that each product has to offer. We want to get rid of the negative stigma about cannabis and help heal. We have thoughtfully chosen our product list, wanting to take advantage of all the new technology this industry has to offer, but all while sticking to its roots. Please stop by today and let us help you.",
          business_email: 'PRC@gmail.com',
          business_instagram: 'palm_royal',
          business_website: 'https://www.palmroyalcannabis.com',
          business_facebook: 'palmroyal-facebook',
          business_type: "venue",
          active_business: "true",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        },
        {
          id: '31399650-c64c-4558-8e0e-f10b5382f474',
          business_name: "Brand New Business",
          business_avatar: "https://picsum.photos/100/100",
          business_description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum gravida malesuada eros, luctus iaculis purus tincidunt consequat. Morbi ac diam nec quam fermentum cursus eget facilisis ex. Integer fringilla diam nec sagittis convallis. Nulla facilisi",
          business_email: 'somethingnew@gmail.com',
          business_instagram: 'something_new',
          business_type: "both",
          active_business: "false",
          business_admin: '2c906eeb-c7f7-4534-ae06-20f601b42224',
        }
      ]);
    });
};
