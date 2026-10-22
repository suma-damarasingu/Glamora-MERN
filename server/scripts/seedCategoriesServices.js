const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Category = require('../models/Category');
const Service = require('../models/Service');

const categoriesToSeed = [
  {
    name: 'Hair',
    description: 'Precision haircuts, vibrant coloring, nourishing spa rituals, and sleek styling.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    services: [
      {
        name: 'Haircut & Styling',
        price: 60,
        duration: '45 mins',
        durationMinutes: 45,
        description: 'Precision haircut customized to your face shape, accompanied by a luxury wash and bouncy blowout styling.',
        image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Global Hair Color',
        price: 150,
        duration: '120 mins',
        durationMinutes: 120,
        description: 'Full-coverage single-tone radiant hair color using ammonia-free, conditioning, rich pigment formulas.',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Keratin Treatment',
        price: 220,
        duration: '150 mins',
        durationMinutes: 150,
        description: 'Intense Brazilian keratin protein smoothing therapy that seals cuticles, eliminates frizz, and adds high gloss.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Hair Spa',
        price: 85,
        duration: '60 mins',
        durationMinutes: 60,
        description: 'Deep hydrating scalp stimulation, restorative botanical mask application, and warm aromatic steam infusion.',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Blow Dry',
        price: 40,
        duration: '30 mins',
        durationMinutes: 30,
        description: 'Voluminous red-carpet blowout with heat protectants and ionic finishing shine for long-lasting bounce.',
        image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Facial',
    description: 'Rejuvenating glow rituals, vortex hydration, and targeted cellular skin therapies.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    services: [
      {
        name: 'Gold Facial',
        price: 140,
        duration: '75 mins',
        durationMinutes: 75,
        description: 'Luxurious 24-karat gold foil infusion facial designed to boost collagen production, firm skin, and restore youthful luminescence.',
        image: 'https://images.unsplash.com/photo-1512290900672-1f02e604758d?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Hydra Facial',
        price: 160,
        duration: '60 mins',
        durationMinutes: 60,
        description: 'Patented vortex vacuum extraction, enzymatic dead skin peel, and peptide antioxidant serum infusion for an instant dewy glow.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Fruit Facial',
        price: 75,
        duration: '45 mins',
        durationMinutes: 45,
        description: 'Natural fresh fruit enzyme polish and calming botanical gel mask rich in Vitamins C and E for gentle brightening.',
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Anti-Aging Facial',
        price: 130,
        duration: '75 mins',
        durationMinutes: 75,
        description: 'Targeted fine-line reduction with micro-current facial contouring, stem-cell serum therapy, and LED light activation.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Charcoal Facial',
        price: 90,
        duration: '50 mins',
        durationMinutes: 50,
        description: 'Activated bamboo charcoal mask that extracts deep-seated blackheads, balances sebum, and minimizes enlarged pores.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Makeup',
    description: 'Flawless bridal glam, camera-ready HD artistry, and luminous party transformations.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    services: [
      {
        name: 'Bridal Makeup',
        price: 250,
        duration: '120 mins',
        durationMinutes: 120,
        description: 'All-inclusive royal bridal makeover with waterproof long-wear HD foundation, sculpted contour, 3D lashes, and touch-up kit.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Party Makeup',
        price: 95,
        duration: '60 mins',
        durationMinutes: 60,
        description: 'Glamorous evening beauty look tailored to your outfit with customized smoky or shimmer eye makeup and long-lasting finish.',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'HD Makeup',
        price: 120,
        duration: '75 mins',
        durationMinutes: 75,
        description: 'High-definition light-diffusing cosmetic application that hides all imperfections seamlessly under high-resolution studio lighting.',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Engagement Makeup',
        price: 180,
        duration: '90 mins',
        durationMinutes: 90,
        description: 'Soft romantic glow with illuminated glass-skin finish, defined brows, and delicate accent lashes perfect for ring ceremony pictures.',
        image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Eye Makeup',
        price: 50,
        duration: '30 mins',
        durationMinutes: 30,
        description: 'Specialized eye glamour including precision eyeliner, multi-tonal eyeshadow blending, cut-crease detailing, and faux lash application.',
        image: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Nails',
    description: 'Artistic gel overlays, soothing spa pedicures, sculpted acrylics, and timeless French tips.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
    services: [
      {
        name: 'Gel Manicure',
        price: 55,
        duration: '45 mins',
        durationMinutes: 45,
        description: 'Complete cuticle therapy, nail shaping, and UV/LED cured high-shine gel polish that remains chip-free for up to 3 weeks.',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Classic Pedicure',
        price: 65,
        duration: '60 mins',
        durationMinutes: 60,
        description: 'Warm eucalyptus whirlpool foot soak, pumice callus removal, invigorating sugar scrub, and tension-relieving calf massage.',
        image: 'https://images.unsplash.com/photo-1519014816548-bf785179c2ff?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Nail Art',
        price: 45,
        duration: '40 mins',
        durationMinutes: 40,
        description: 'Bespoke hand-painted creative designs, metallic chrome glazing, 3D rhinestones, and abstract minimalist patterns.',
        image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Acrylic Extensions',
        price: 90,
        duration: '90 mins',
        durationMinutes: 90,
        description: 'Strong yet feather-light full set acrylic nail enhancements sculpted to coffin, almond, stiletto, or square shapes.',
        image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'French Manicure',
        price: 60,
        duration: '50 mins',
        durationMinutes: 50,
        description: 'Crisp smile line white tips over a sheer natural nude-pink base, sealed with mirror-shine protective diamond top coat.',
        image: 'https://images.unsplash.com/photo-1519014816548-bf785179c2ff?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Skin Care',
    description: 'Full body waxing, exfoliating polishes, precision threading, and de-tan skin rejuvenation.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    services: [
      {
        name: 'Full Body Waxing',
        price: 110,
        duration: '75 mins',
        durationMinutes: 75,
        description: 'Hygienic, gentle peel-off chocolate wax treatment for silky smooth arms, legs, underarms, and body contour.',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'De-Tan Treatment',
        price: 70,
        duration: '45 mins',
        durationMinutes: 45,
        description: 'Active natural AHA lightening pack that gently dissolves stubborn sun tanning, clears dark patches, and restores even tone.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Skin Polishing',
        price: 125,
        duration: '60 mins',
        durationMinutes: 60,
        description: 'Micro-crystal body exfoliation coupled with nourishing vitamin oil massage to remove dullness and yield velvet-soft skin.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Threading (Eyebrows & Upper Lip)',
        price: 25,
        duration: '20 mins',
        durationMinutes: 20,
        description: 'High-precision organic cotton thread plucking that produces crisp arch definition and thorough upper-lip hair removal.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Bleach',
        price: 35,
        duration: '30 mins',
        durationMinutes: 30,
        description: 'Ammonia-free herbal oxygen bleach formulated to gently lighten dark facial hair to match natural skin tone without stinging.',
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

const defaultSlots = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM'
];

const seedCategoriesAndServices = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glamora';
    console.log('🔄 Connecting to MongoDB for Category & Service seeding...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB.');

    let totalCategoriesProcessed = 0;
    let totalServicesProcessed = 0;

    for (const catData of categoriesToSeed) {
      // Find or create category by name (case-insensitive)
      let category = await Category.findOne({
        name: { $regex: new RegExp(`^${catData.name}$`, 'i') }
      });

      if (category) {
        category.name = catData.name;
        category.description = catData.description;
        category.image = catData.image;
        await category.save();
        console.log(`📁 Category updated: [${category.name}]`);
      } else {
        category = await Category.create({
          name: catData.name,
          description: catData.description,
          image: catData.image
        });
        console.log(`📁 Category created: [${category.name}]`);
      }

      totalCategoriesProcessed++;

      // Seed 5 services for this category
      for (const srvData of catData.services) {
        let service = await Service.findOne({
          name: { $regex: new RegExp(`^${srvData.name}$`, 'i') },
          categoryId: category._id
        });

        if (service) {
          service.name = srvData.name;
          service.price = srvData.price;
          service.duration = srvData.duration;
          service.durationMinutes = srvData.durationMinutes;
          service.description = srvData.description;
          service.image = srvData.image;
          service.slots = defaultSlots;
          service.isActive = true;
          await service.save();
          console.log(`   ✨ Service updated: ${service.name} ($${service.price}, ${service.duration})`);
        } else {
          service = await Service.create({
            name: srvData.name,
            categoryId: category._id,
            price: srvData.price,
            duration: srvData.duration,
            durationMinutes: srvData.durationMinutes,
            description: srvData.description,
            image: srvData.image,
            startTime: '09:00 AM',
            endTime: '08:00 PM',
            slots: defaultSlots,
            isActive: true
          });
          console.log(`   ✨ Service created: ${service.name} ($${service.price}, ${service.duration})`);
        }

        totalServicesProcessed++;
      }
    }

    console.log('\n========================================================');
    console.log('🎉 CATEGORIES & SERVICES SEEDED SUCCESSFULLY!');
    console.log('========================================================');
    console.log(`✅ Total Categories: ${totalCategoriesProcessed} (Hair, Facial, Makeup, Nails, Skin Care)`);
    console.log(`✅ Total Services:   ${totalServicesProcessed} (5 per Category = 25 Services)`);
    console.log('========================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedCategoriesAndServices();
