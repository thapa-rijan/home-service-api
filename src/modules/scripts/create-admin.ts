import * as path from 'path';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { Authorization } from '../auth/entity/authorization';
import { Role } from '../auth/entity/role.entity';
import { User } from '../auth/entity/user.entity';
import { PhoneNumber } from '../auth/entity/phone-number.entity';
import { Provider } from '../auth/entity/provider.entity';
import { IdentityProof } from '../auth/entity/identity-proof.entity';
import { Service } from '../services/entity/service.entity';
import { File } from '../fileUpload/entity/file.entity';
import { Category } from '../category/entity/category.entity';
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

/** Drop stale user-related tables so synchronize can recreate them with the new schema. */
async function dropUserTables() {
  const rawDs = new DataSource({
    ...dbConfig,
    entities: [],
    synchronize: false,
  });
  await rawDs.initialize();
  await rawDs.query(`DROP TABLE IF EXISTS "phone_number" CASCADE`);
  await rawDs.query(`DROP TABLE IF EXISTS "provider" CASCADE`);
  await rawDs.query(`DROP TABLE IF EXISTS "user" CASCADE`);
  await rawDs.query(`DROP TYPE IF EXISTS "public"."user_role_enum" CASCADE`);
  await rawDs.query(`DROP TYPE IF EXISTS "public"."user_status_enum" CASCADE`);
  await rawDs.destroy();
  console.log('Dropped stale tables (user, phone_number, provider).');
}

const AppDataSource = new DataSource({
  ...dbConfig,
  synchronize: true,
  entities: [
    Authorization,
    Role,
    User,
    PhoneNumber,
    Provider,
    IdentityProof,
    Service,
    File,
    Category,
  ],
});

async function createAdminUser() {
  const adminEmail = 'admin@gmail.com';
  try {
    await dropUserTables();
    const dataSource = await AppDataSource.initialize();
    const userRepo = dataSource.getRepository(User);
    const existingAdmin = await userRepo.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log('Admin already exists with this email');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('service@admin2025', 10);

    const newUser = userRepo.create({
      id: `AD-${StringUtils.generateRandomAlphaNumeric(10)}`,
      fullName: 'Home Service Admin',
      email: adminEmail,
      password: hashedPassword,
      address: 'Banepa, Nepal',
      role: RoleEnum.ADMIN,
    });

    const savedUser = await userRepo.save(newUser);

    const phoneRepo = dataSource.getRepository(PhoneNumber);
    await phoneRepo.save(
      phoneRepo.create({
        id: `PH_${StringUtils.generateRandomAlphaNumeric(10)}`,
        phoneNumber: '0412345678',
        user: savedUser,
      }),
    );

    console.log(` Admin user created successfully! (id: ${savedUser.id})`);
    process.exit(0);
  } catch (error: unknown) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

void createAdminUser();
