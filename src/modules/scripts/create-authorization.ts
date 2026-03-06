import * as dotenv from 'dotenv';
import * as path from 'path';
import { Role } from '../auth/entity/role.entity';
import { Authorization } from '../auth/entity/authorization';
import { User } from '../auth/entity/user.entity';
import { PhoneNumber } from '../auth/entity/phone-number.entity';
import { Provider } from '../auth/entity/provider.entity';
import { DataSource } from 'typeorm';
import { RoleEnum } from 'src/common';
import { StringUtils } from 'src/core';

const readOnlyMethods = ['GET'];
const writeMethods = ['DELETE', 'PUT', 'PATCH'];

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

/** Drop stale tables and old enum types so synchronize can recreate them cleanly. */
async function dropStaleTables() {
  const rawDs = new DataSource({
    ...dbConfig,
    entities: [],
    synchronize: false,
  });
  await rawDs.initialize();
  await rawDs.query(`DROP TABLE IF EXISTS "authorization" CASCADE`);
  await rawDs.query(`DROP TABLE IF EXISTS "role" CASCADE`);
  await rawDs.query(`DROP TABLE IF EXISTS "phone_number" CASCADE`);
  await rawDs.query(`DROP TABLE IF EXISTS "provider" CASCADE`);
  await rawDs.query(`DROP TABLE IF EXISTS "user" CASCADE`);
  // Drop stale enum types so Postgres accepts the new values
  await rawDs.query(`DROP TYPE IF EXISTS "public"."role_role_enum" CASCADE`);
  await rawDs.query(`DROP TYPE IF EXISTS "public"."user_role_enum" CASCADE`);
  await rawDs.query(`DROP TYPE IF EXISTS "public"."user_status_enum" CASCADE`);
  await rawDs.destroy();
  console.log('Dropped stale tables and enum types.');
}

const AppDataSource = new DataSource({
  ...dbConfig,
  entities: [Authorization, Role, User, PhoneNumber, Provider],
  synchronize: true,
});

async function createRolesIfNotExist(dataSource: DataSource) {
  const roles = [...Object.values(RoleEnum)];
  const roleRepository = dataSource.getRepository(Role);

  for (const roleName of roles) {
    let roleEntity = await roleRepository.findOne({
      where: { role: roleName },
    });

    if (!roleEntity) {
      roleEntity = roleRepository.create({
        id: `RL-${StringUtils.generateRandomAlphaNumeric(7)}`,
        role: roleName,
        description: `${roleName} role`,
      });
      await roleRepository.save(roleEntity);
      console.log(`Created role: ${roleName}`);
    }
  }
}

function setAuthorizationPermissions(
  role: Role,
  path: string,
  methods: string[],
): Authorization {
  const authorization = new Authorization();
  authorization.id = `AU-${StringUtils.generateRandomAlphaNumeric(7)}`;
  authorization.role = role;
  authorization.path = path;
  authorization.methods = methods;
  return authorization;
}

function getAdminPermissions(role: Role): Authorization[] {
  return [
    // Users module
    setAuthorizationPermissions(role, '/users', [...readOnlyMethods]),
    setAuthorizationPermissions(role, '/users/customers', [...readOnlyMethods]),
    setAuthorizationPermissions(role, '/users/:id', [
      ...readOnlyMethods,
      ...writeMethods,
    ]),
    // Providers module
    setAuthorizationPermissions(role, '/providers', [...readOnlyMethods]),
    setAuthorizationPermissions(role, '/providers/:id', [...readOnlyMethods]),
  ];
}

function getCustomerPermissions(role: Role): Authorization[] {
  return [
    // Customers can view their own user record and browse providers
    setAuthorizationPermissions(role, '/users/:id', [...readOnlyMethods]),
    setAuthorizationPermissions(role, '/providers', [...readOnlyMethods]),
    setAuthorizationPermissions(role, '/providers/:id', [...readOnlyMethods]),
  ];
}

function getProviderPermissions(role: Role): Authorization[] {
  return [
    // Providers can browse other providers
    setAuthorizationPermissions(role, '/providers', [...readOnlyMethods]),
    setAuthorizationPermissions(role, '/providers/:id', [...readOnlyMethods]),
  ];
}

async function createAuthorization() {
  try {
    await dropStaleTables();
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    await createRolesIfNotExist(AppDataSource);

    const roleRepository = AppDataSource.getRepository(Role);
    /* eslint-disable @typescript-eslint/no-unsafe-assignment */
    const results = await Promise.all([
      roleRepository.findOne({ where: { role: RoleEnum.ADMIN } }),
      roleRepository.findOne({ where: { role: RoleEnum.CUSTOMER } }),
      roleRepository.findOne({ where: { role: RoleEnum.PROVIDER } }),
    ]);
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    const [adminRole, customerRole, providerRole] = results;

    if (!adminRole || !customerRole || !providerRole) {
      throw new Error('One or more roles not found');
    }

    const authorizations = [
      ...getAdminPermissions(adminRole),
      ...getCustomerPermissions(customerRole),
      ...getProviderPermissions(providerRole),
    ];

    // console.log('Authorizations to save:', authorizations);

    await AppDataSource.manager.save(Authorization, authorizations);
    console.log('Saved authorizations!');
  } catch (error) {
    console.error('Error creating Authorization:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('Data Source connection closed.');
  }
}

void createAuthorization();
