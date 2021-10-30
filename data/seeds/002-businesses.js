
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('businesses').del()
    .then(function () {
      // Inserts seed entries
      return knex('businesses').insert([
        {
          name: "STIIIZY",
          email: "stiiizy@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "STIIIZY is known as an innovative, award-winning, California-based cannabis brand. Founded in 2017 as a pioneering vape company, STIIIZY evolved into so much more. Today, STIIIZY has become one of the world's most treasured cannabis brands with its class defining retail stores and amazing cannabis products. Always innovating, always inspiring, always influencing: that's us. Let's take it to new heights.",
          businesstype: "brand",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "West Coast Cure",
          email: "wcc@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "West Coast Cure brings years of connoisseur cannabis mastery to the table, effortlessly offering consumers the best marijuana experience. With an award-winning pedigree and that extra something special, West Coast Cure is the go-to cannabis label for the true connoisseur. It’s not something West Coast Cure works at; they simply have a Passion for Cannabis.",
          businesstype: "brand",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "Old Pal",
          email: "oldPal@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "Accessible, affordable, and abundant, Old Pal’s vision is simple: It’s just weed, y'all. Neighbor grown and meant to be shared, our cannabis is all natural, sun-kissed, and rain-watered. Available in three simple varieties: Indica, Sativa, and Hybrid - this is weed for the people. Old Pal is an ode to simpler times, when weed was just weed and joints were passed around to old pals and new ones. When neighbors knew each other by name and community meant something. So grab a bag of Old Pal and pass it around. It’s time we took care of each other.Old Pal is currently available in California, Nevada, and Oklahoma.",
          businesstype: "brand",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "The Cure Company",
          email: "cureco@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "Licensed to produce quality cannabis products. Clean, organic, and single sourced. The Cure Company is Los Angeles source to the most exceptional cannabis flowers, concentrates, and edibles. The Cure Company group is proud to supply cannabis products Southern Californians can rely upon, safe and lab tested.",
          businesstype: "brand",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "Green Dragon",
          email: "greendragon@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "Green Dragon Farms offers a myriad of strain varieties derived from the healthiest and most stable mother plants. Folks can’t get enough of their San Fernando Valley OG clones or flowers. This phenotype of OG Kush provides a large yield with buds blanketed in trichomes. Find the strain you love and bring those buds to life with Green Dragon Farms.",
          businesstype: "both",
          contact: "instagram",
          requestOpen: false
        },
        {
          name: "BARE Dispensary",
          email: "Bare@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "At Bare Dispensary, we take pride in providing the best prices for a vast selection of high quality cannabis products for our customers within a comfortable, clean, and professional environment. Our bud-tenders are knowledgeable and can provide recommendations for the specific needs of both medical patients as well as recreational consumers. Every person is different, which is why we offer a wide variety of options on everything from flower, vapes, and concentrates, to tinctures, topicals, and CBD products.",
          businesstype: "both",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "Desert's Finest",
          email: "dFinest@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "We are one of the top recreational cannabis dispensaries in the Coachella Valley, and are proud to serve people from Desert Hot Springs, Palm Springs, Yucca Valley, Joshua Tree, and beyond! Our beautiful, desert-inspired boutique-style marijuana dispensary welcomes everyone 21 and holds a large variety of strains, vapes, edibles, transdermal balms, tinctures, and much more! We are proud to carry the top-of-the-line CBD products from Papa & Barkley, Mary's Medicinals, CBD Living amazing THC products from Los Angeles Kush, CRU Cannabis, and Cookies (just to name a few!) We take CASH & CREDIT/DEBIT, ATM available at your convenience.",
          businesstype: "venue",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "No Wait Meds",
          email: "nowaiting@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "Here at No Wait Meds, we are excited to serve you with premium quality product, at the lowest prices the valley has to offer. Our hand picked team of bud tenders is dedicated to you and your experience. We value your time and convenience so we can help you spend less time waiting, and more time enjoying.",
          businesstype: "venue",
          contact: "instagram",
          requestOpen: true
        },
        {
          name: "Palm Royal Cannabis",
          email: "PRC@gmail.com",
          avatar: "https://picsum.photos/100/100",
          description: "It's simple, we believe in the cause and we want to help our customers/patients find the right products that best suit their needs. We live in a very exciting time, and here at Palm Royale we want to help educate and show the true beauty that each product has to offer. We want to get rid of the negative stigma about cannabis and help heal. We have thoughtfully chosen our product list, wanting to take advantage of all the new technology this industry has to offer, but all while sticking to its roots. Please stop by today and let us help you.",
          businesstype: "venue",
          contact: "instagram",
          requestOpen: true
        }
      ]);
    });
};
