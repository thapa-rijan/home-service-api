import * as path from 'path';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Authorization } from '../auth/entity/authorization';
import { Role } from '../auth/entity/role.entity';
import { User } from '../auth/entity/user.entity';
import { PhoneNumber } from '../auth/entity/phone-number.entity';
import { Provider } from '../auth/entity/provider.entity';
import { StringUtils } from 'src/core';
import { RoleEnum } from 'src/common';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
};

const AppDataSource = new DataSource({
  ...dbConfig,
  synchronize: false,
  entities: [Authorization, Role, User, PhoneNumber, Provider],
});

const CUSTOMER_COUNT = 20;
const PROVIDER_COUNT = 20;

const customerNames = [
  'Aarav Sharma',
  'Bipana Thapa',
  'Chiranjibi Poudel',
  'Deepika Adhikari',
  'Ekaraj Bhandari',
  'Fulkumari Rai',
  'Ganesh Karki',
  'Hira Tamang',
  'Indira Shrestha',
  'Jagannath Koirala',
  'Kamala Magar',
  'Lokendra Basnet',
  'Manisha Gurung',
  'Nabin Budhathoki',
  'Ojasvi Pandey',
  'Pradeep Limbu',
  'Rajani Khatri',
  'Suman Dahal',
  'Trishna Neupane',
  'Umesh Oli',
];

const providerNames = [
  'Anish Maharjan',
  'Barsha Lama',
  'Chandra Bahadur Chand',
  'Diwas Subedi',
  'Elina Acharya',
  'Fanindra Dhakal',
  'Gita Hamal',
  'Hari Prasad Joshi',
  'Isha Bhattarai',
  'Janak Rijal',
  'Karishma Bohara',
  'Lalit Sapkota',
  'Menuka Giri',
  'Nirajan Tiwari',
  'Prabha Devkota',
  'Roshan Pulami',
  'Sarita Sunuwar',
  'Tilak Bahadur Saud',
  'Uday Chaudhary',
  'Yamuna Tharu',
];

const specializations = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Landscaping',
  'HVAC',
  'Roofing',
  'Flooring',
  'Appliance Repair',
];

async function seedUsers() {
  try {
    const dataSource = await AppDataSource.initialize();
    const userRepo = dataSource.getRepository(User);
    const phoneRepo = dataSource.getRepository(PhoneNumber);
    const providerRepo = dataSource.getRepository(Provider);

    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // ── Seed Customers ──────────────────────────────────────────────────────
    console.log(`\nCreating ${CUSTOMER_COUNT} customer users...`);
    let customersCreated = 0;

    for (let i = 0; i < CUSTOMER_COUNT; i++) {
      const emailSlug = customerNames[i].toLowerCase().replace(/\s+/g, '.');
      const email = `${emailSlug}@example.com`;

      const existing = await userRepo.findOne({ where: { email } });
      if (existing) {
        console.log(`  [SKIP] Customer already exists: ${email}`);
        continue;
      }

      const newUser = userRepo.create({
        id: `CU-${StringUtils.generateRandomAlphaNumeric(10)}`,
        fullName: customerNames[i],
        email,
        password: hashedPassword,
        address: 'Kathmandu, Nepal',
        role: RoleEnum.CUSTOMER,
      });

      const savedUser = await userRepo.save(newUser);

      await phoneRepo.save(
        phoneRepo.create({
          id: `PH_${StringUtils.generateRandomAlphaNumeric(10)}`,
          phoneNumber: `98${String(40000000 + i).padStart(8, '0')}`,
          user: savedUser,
        }),
      );

      console.log(
        `  [OK] Customer created: ${savedUser.fullName} (${savedUser.id})`,
      );
      customersCreated++;
    }

    // ── Seed Providers ──────────────────────────────────────────────────────
    console.log(`\nCreating ${PROVIDER_COUNT} provider users...`);
    let providersCreated = 0;

    for (let i = 0; i < PROVIDER_COUNT; i++) {
      const emailSlug = providerNames[i].toLowerCase().replace(/\s+/g, '.');
      const email = `${emailSlug}@example.com`;

      const existing = await userRepo.findOne({ where: { email } });
      if (existing) {
        console.log(`  [SKIP] Provider already exists: ${email}`);
        continue;
      }

      const newUser = userRepo.create({
        id: `PR-${StringUtils.generateRandomAlphaNumeric(10)}`,
        fullName: providerNames[i],
        email,
        password: hashedPassword,
        address: 'Lalitpur, Nepal',
        role: RoleEnum.PROVIDER,
      });

      const savedUser = await userRepo.save(newUser);

      await phoneRepo.save(
        phoneRepo.create({
          id: `PH_${StringUtils.generateRandomAlphaNumeric(10)}`,
          phoneNumber: `97${String(40000000 + i).padStart(8, '0')}`,
          user: savedUser,
        }),
      );

      await providerRepo.save(
        providerRepo.create({
          id: `PV_${StringUtils.generateRandomAlphaNumeric(10)}`,
          experienceYear: Math.floor(Math.random() * 10) + 1,
          ratePerHour: parseFloat((Math.random() * 45 + 5).toFixed(2)),
          specialization: specializations[i % specializations.length],
          rating: parseFloat((Math.random() * 2 + 3).toFixed(2)),
          jobCompleted: Math.floor(Math.random() * 100),
          user: savedUser,
        }),
      );

      console.log(
        `  [OK] Provider created: ${savedUser.fullName} (${savedUser.id})`,
      );
      providersCreated++;
    }

    console.log(`\nSeed complete:`);
    console.log(`  Customers created : ${customersCreated}`);
    console.log(`  Providers created : ${providersCreated}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

void seedUsers();
