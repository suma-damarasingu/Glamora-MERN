const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Favorite = require('./models/Favorite');

const seedDatabase = async () => {
  let mongoServer = null;
  try {
    console.log('🔄 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glamora';

    let connected = false;
    if (mongoUri.includes('mongodb+srv://') || process.env.MONGODB_URI) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        connected = true;
        console.log('✅ Connected to MongoDB Atlas.');
      } catch (e) {
        console.warn('⚠️ Atlas connection failed:', e.message);
      }
    }

    if (!connected) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
        connected = true;
        console.log('✅ Connected to Local MongoDB.');
      } catch (localErr) {
        console.log('ℹ️ Local MongoDB not detected. Booting In-Memory MongoDB for seeding...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();
        await mongoose.connect(inMemoryUri);
        connected = true;
        console.log('✅ Connected to In-Memory MongoDB.');
      }
    }

    // Clear existing collections
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Favorite.deleteMany();

    // 1. Seed ONE Admin user (as strictly specified: "only ONE admin exists (seeded in DB)")
    console.log('👤 Seeding Admin account...');
    const adminUser = await User.create({
      name: 'Glamora Admin',
      email: 'admin@glamora.com',
      phone: '+1 555-0199',
      password: 'AdminPassword123!',
      role: 'admin',
      isVerified: true,
      profilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
    });

    // Seed demo customer
    console.log('👩 Seeding Demo Customer account...');
    const demoCustomer = await User.create({
      name: 'Sophia Miller',
      email: 'customer@glamora.com',
      phone: '+1 555-0248',
      password: 'CustomerPassword123!',
      role: 'customer',
      isVerified: true,
      profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });

    // 2. Seed 5 Categories
    console.log('🌸 Seeding Categories (Hair, Makeup, Skin, Nails, Spa)...');
    const categoriesData = [
      {
        name: 'Hair',
        description: 'Luxury haircuts, balayage, silk presses, and revitalizing treatments.',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Makeup',
        description: 'Flawless bridal, evening glam, and editorial makeup looks.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Skin',
        description: 'Advanced facials, enzymatic peels, and rejuvenating skin therapy.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Nails',
        description: 'Custom gel nail art, acrylic sets, and relaxing spa pedicures.',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Spa',
        description: 'Aromatherapy body massages, hot stone rituals, and rose body scrubs.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      }
    ];

    const createdCategories = await Category.insertMany(categoriesData);
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Seed Services under each Category
    console.log('✨ Seeding Services...');
    const servicesData = [
      // Hair
      {
        name: 'Signature Balayage & Blowdry',
        categoryId: categoryMap['Hair'],
        price: 140,
        duration: '90 mins',
        description: 'Hand-painted dimensional sun-kissed color finished with a signature blowout.',
        image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Silk Press & Deep Hydration',
        categoryId: categoryMap['Hair'],
        price: 75,
        duration: '60 mins',
        description: 'Steam hydration therapy paired with a silky, heat-protected smooth finish.',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Precision Cut & Styling',
        categoryId: categoryMap['Hair'],
        price: 55,
        duration: '45 mins',
        description: 'Customized haircut tailored to your face shape, followed by professional styling.',
        image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },

      // Makeup
      {
        name: 'Royal Bridal Makeup Package',
        categoryId: categoryMap['Makeup'],
        price: 190,
        duration: '75 mins',
        description: 'High-definition long-lasting bridal beauty with premium lashes and touch-up kit.',
        image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Red Carpet Evening Glam',
        categoryId: categoryMap['Makeup'],
        price: 95,
        duration: '60 mins',
        description: 'Smokey or shimmer glam eye look with sculpted contour and luminous glow.',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Soft Dewy Everyday Glow',
        categoryId: categoryMap['Makeup'],
        price: 65,
        duration: '45 mins',
        description: 'Natural radiant base, brushed-up brows, and soft tinted lips for a fresh finish.',
        image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },

      // Skin
      {
        name: 'HydraFacial Deep Glow Treatment',
        categoryId: categoryMap['Skin'],
        price: 130,
        duration: '60 mins',
        description: 'Patented vortex suction cleansing, exfoliation, and antioxidant infusion.',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Anti-Aging Collagen Infusion',
        categoryId: categoryMap['Skin'],
        price: 105,
        duration: '50 mins',
        description: 'Firming peptide serum with micro-current lifting and LED light therapy.',
        image: 'https://images.unsplash.com/photo-1512290900672-1f02e604758d?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Gentle Botanical Enzyme Peel',
        categoryId: categoryMap['Skin'],
        price: 85,
        duration: '45 mins',
        description: 'Fruit enzyme exfoliation designed to brighten sensitive and tired complexions.',
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },

      // Nails
      {
        name: 'Luxury Gel Art Manicure',
        categoryId: categoryMap['Nails'],
        price: 60,
        duration: '50 mins',
        description: 'Cuticle care, chip-free gel polish, and hand-painted accent nail art.',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Elysian Spa Pedicure & Scrub',
        categoryId: categoryMap['Nails'],
        price: 70,
        duration: '60 mins',
        description: 'Warm eucalyptus foot soak, exfoliating sugar scrub, and tension-relief massage.',
        image: 'https://images.unsplash.com/photo-1519014816548-bf785179c2ff?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Apres Gel-X Sculpted Full Set',
        categoryId: categoryMap['Nails'],
        price: 90,
        duration: '75 mins',
        description: 'Lightweight full coverage soft gel extensions with crystal clear shaping.',
        image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },

      // Spa
      {
        name: 'Aromatherapy Relaxing Body Massage',
        categoryId: categoryMap['Spa'],
        price: 115,
        duration: '60 mins',
        description: 'Swedish massage techniques infused with pure organic lavender and rose oils.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Volcanic Hot Stone Therapy',
        categoryId: categoryMap['Spa'],
        price: 135,
        duration: '75 mins',
        description: 'Heated basalt stones to melt muscular tension and restore total balance.',
        image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
        isActive: true
      },
      {
        name: 'Moroccan Rose Body Polish',
        categoryId: categoryMap['Spa'],
        price: 95,
        duration: '50 mins',
        description: 'Delicate pink rose petal exfoliation followed by whipped shea butter massage.',
        image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
        isActive: true
      }
    ];

    const createdServices = await Service.insertMany(servicesData);

    // 4. Seed Favorites for Sophia
    console.log('❤️ Seeding Favorites...');
    await Favorite.create({
      userId: demoCustomer._id,
      serviceId: createdServices[0]._id
    });
    await Favorite.create({
      userId: demoCustomer._id,
      serviceId: createdServices[3]._id
    });

    // 5. Seed realistic bookings across past few days for Chart Analytics!
    console.log('📅 Seeding sample bookings for Admin Analytics charts...');
    const today = new Date();
    const getDateString = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() - offsetDays);
      return d.toISOString().split('T')[0];
    };

    const bookingsToSeed = [
      {
        userId: demoCustomer._id,
        serviceId: createdServices[0]._id, // Balayage ($140)
        date: getDateString(5),
        timeSlot: '10:00 AM',
        address: '742 Evergreen Terrace, Suite 4B',
        notes: 'Pre-wedding appointment',
        status: 'completed',
        price: 140
      },
      {
        userId: demoCustomer._id,
        serviceId: createdServices[3]._id, // Bridal Makeup ($190)
        date: getDateString(4),
        timeSlot: '12:00 PM',
        address: '742 Evergreen Terrace, Suite 4B',
        notes: 'Requested neutral tones',
        status: 'completed',
        price: 190
      },
      {
        userId: demoCustomer._id,
        serviceId: createdServices[6]._id, // HydraFacial ($130)
        date: getDateString(3),
        timeSlot: '02:00 PM',
        address: '742 Evergreen Terrace, Suite 4B',
        notes: 'Sensitive skin',
        status: 'completed',
        price: 130
      },
      {
        userId: demoCustomer._id,
        serviceId: createdServices[9]._id, // Gel Nails ($60)
        date: getDateString(2),
        timeSlot: '04:00 PM',
        address: '742 Evergreen Terrace, Suite 4B',
        notes: 'French tip with rose accents',
        status: 'accepted',
        price: 60
      },
      {
        userId: demoCustomer._id,
        serviceId: createdServices[12]._id, // Aromatherapy ($115)
        date: getDateString(1),
        timeSlot: '10:00 AM',
        address: '742 Evergreen Terrace, Suite 4B',
        notes: 'Focus on shoulder stress',
        status: 'pending',
        price: 115
      },
      {
        userId: demoCustomer._id,
        serviceId: createdServices[1]._id, // Silk Press ($75)
        date: getDateString(0),
        timeSlot: '06:00 PM',
        address: '742 Evergreen Terrace, Suite 4B',
        notes: 'First time client styling',
        status: 'pending',
        price: 75
      }
    ];

    await Booking.insertMany(bookingsToSeed);

    console.log('\n==================================================');
    console.log('🎉 GLAMORA DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('👑 Admin Account:');
    console.log('   Email:    admin@glamora.com');
    console.log('   Password: AdminPassword123!');
    console.log('   Role:     admin');
    console.log('--------------------------------------------------');
    console.log('👩 Customer Account:');
    console.log('   Email:    customer@glamora.com');
    console.log('   Password: CustomerPassword123!');
    console.log('   Role:     customer');
    console.log('--------------------------------------------------');
    console.log(`📦 Seeded:`);
    console.log(`   - 5 Categories`);
    console.log(`   - ${createdServices.length} Services`);
    console.log(`   - ${bookingsToSeed.length} Bookings`);
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
