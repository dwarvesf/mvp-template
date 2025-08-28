import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default permissions for the RBAC system
const DEFAULT_PERMISSIONS = [
  // Organization Management
  { name: 'org.read', resource: 'org', action: 'read', description: 'View organization details', isSystem: true },
  { name: 'org.update', resource: 'org', action: 'update', description: 'Update organization settings', isSystem: true },
  { name: 'org.delete', resource: 'org', action: 'delete', description: 'Delete organization', isSystem: true },
  { name: 'org.transfer', resource: 'org', action: 'transfer', description: 'Transfer organization ownership', isSystem: true },
  
  // Member Management
  { name: 'members.read', resource: 'members', action: 'read', description: 'View organization members', isSystem: true },
  { name: 'members.invite', resource: 'members', action: 'invite', description: 'Invite new members', isSystem: true },
  { name: 'members.update', resource: 'members', action: 'update', description: 'Update member roles', isSystem: true },
  { name: 'members.remove', resource: 'members', action: 'remove', description: 'Remove members from organization', isSystem: true },
  
  // Invitation Management
  { name: 'invitations.create', resource: 'invitations', action: 'create', description: 'Create invitations', isSystem: true },
  { name: 'invitations.read', resource: 'invitations', action: 'read', description: 'View invitations', isSystem: true },
  { name: 'invitations.revoke', resource: 'invitations', action: 'revoke', description: 'Revoke invitations', isSystem: true },
  
  // Billing & Subscription
  { name: 'billing.read', resource: 'billing', action: 'read', description: 'View billing information', isSystem: true },
  { name: 'billing.update', resource: 'billing', action: 'update', description: 'Update payment methods', isSystem: true },
  { name: 'billing.manage', resource: 'billing', action: 'manage', description: 'Manage subscription plans', isSystem: true },
  
  // API Keys & Integrations
  { name: 'api_keys.create', resource: 'api_keys', action: 'create', description: 'Create API keys', isSystem: true },
  { name: 'api_keys.read', resource: 'api_keys', action: 'read', description: 'View API keys', isSystem: true },
  { name: 'api_keys.revoke', resource: 'api_keys', action: 'revoke', description: 'Revoke API keys', isSystem: true },
  
  // Audit & Security
  { name: 'audit.read', resource: 'audit', action: 'read', description: 'View audit logs', isSystem: true },
  { name: 'security.manage', resource: 'security', action: 'manage', description: 'Manage security settings', isSystem: true }
];

// Role permission mappings
const ROLE_PERMISSIONS = {
  owner: [
    'org.*',           // All org permissions
    'members.*',       // All member permissions
    'invitations.*',   // All invitation permissions
    'billing.*',       // All billing permissions
    'api_keys.*',      // All API key permissions
    'audit.*',         // All audit permissions
    'security.*'       // All security permissions
  ],
  admin: [
    'org.read',
    'org.update',
    'members.read',
    'members.invite',
    'members.update',
    'members.remove',
    'invitations.create',
    'invitations.read',
    'invitations.revoke',
    'api_keys.create',
    'api_keys.read',
    'api_keys.revoke',
    'audit.read'
  ],
  member: [
    'org.read',
    'members.read',
    'invitations.read',
    'api_keys.read'
  ]
};

async function seedRBACPermissions() {
  console.log('🔐 Seeding RBAC permissions...');
  
  // Create all permissions
  const permissions = new Map<string, any>();
  
  for (const perm of DEFAULT_PERMISSIONS) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    });
    permissions.set(permission.name, permission);
  }
  
  console.log(`✅ Created ${permissions.size} permissions`);
  
  // Create system roles
  const roles = new Map<string, any>();
  
  // For system roles, we need to handle them differently since orgId is nullable
  const existingOwnerRole = await prisma.role.findFirst({
    where: { name: 'owner', orgId: null }
  });
  
  const ownerRole = existingOwnerRole || await prisma.role.create({
    data: {
      name: 'owner',
      displayName: 'Owner',
      description: 'Full organization control',
      isSystem: true,
      isDefault: false
    }
  });
  roles.set('owner', ownerRole);
  
  const existingAdminRole = await prisma.role.findFirst({
    where: { name: 'admin', orgId: null }
  });
  
  const adminRole = existingAdminRole || await prisma.role.create({
    data: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Manage organization and members',
      isSystem: true,
      isDefault: false
    }
  });
  roles.set('admin', adminRole);
  
  const existingMemberRole = await prisma.role.findFirst({
    where: { name: 'member', orgId: null }
  });
  
  const memberRole = existingMemberRole || await prisma.role.create({
    data: {
      name: 'member',
      displayName: 'Member',
      description: 'Basic access to organization',
      isSystem: true,
      isDefault: true  // Default role for new members
    }
  });
  roles.set('member', memberRole);
  
  console.log(`✅ Created ${roles.size} system roles`);
  
  // Map permissions to roles
  for (const [roleName, permPatterns] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roles.get(roleName);
    if (!role) continue;
    
    // Find matching permissions
    const rolePermissions: any[] = [];
    for (const pattern of permPatterns) {
      if (pattern.endsWith('*')) {
        // Wildcard pattern - match all permissions starting with prefix
        const prefix = pattern.slice(0, -1);
        for (const [permName, permission] of permissions.entries()) {
          if (permName.startsWith(prefix)) {
            rolePermissions.push(permission);
          }
        }
      } else {
        // Exact match
        const permission = permissions.get(pattern);
        if (permission) {
          rolePermissions.push(permission);
        }
      }
    }
    
    // Create role-permission mappings
    for (const permission of rolePermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: { granted: true },
        create: {
          roleId: role.id,
          permissionId: permission.id,
          granted: true
        }
      });
    }
    
    console.log(`✅ Assigned ${rolePermissions.length} permissions to ${roleName} role`);
  }
}

async function seedFeatureFlags() {
  console.log('🚩 Seeding feature flags...');
  
  await prisma.featureFlag.upsert({
    where: { name: 'org_feature_enabled' },
    update: {},
    create: {
      name: 'org_feature_enabled',
      enabled: true,
      config: {
        description: 'Enable multi-organization feature',
        allowCustomRoles: false,
        maxOrgsPerUser: 10
      }
    }
  });
  
  console.log('✅ Created feature flags');
}

async function seedTestUsers() {
  console.log('👥 Seeding test users...');
  
  const testUsers = [
    { email: 'owner@example.com', name: 'John Owner', password: 'Owner123!' },
    { email: 'admin@example.com', name: 'Jane Admin', password: 'Admin123!' },
    { email: 'member@example.com', name: 'Bob Member', password: 'Member123!' },
    { email: 'alice@example.com', name: 'Alice Developer', password: 'Alice123!' },
    { email: 'mvp@example.com', name: 'MVP User', password: 'Pwd123!' },
  ];
  
  const users = new Map<string, any>();
  
  for (const userData of testUsers) {
    let user = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (!user) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          verified: true,
        },
      });
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`ℹ️  User ${user.email} already exists`);
    }
    
    users.set(user.email, user);
  }
  
  return users;
}

async function seedOrganizations(users: Map<string, any>) {
  console.log('🏢 Seeding organizations...');
  
  // Get roles
  const ownerRole = await prisma.role.findFirst({ where: { name: 'owner', orgId: null } });
  const adminRole = await prisma.role.findFirst({ where: { name: 'admin', orgId: null } });
  const memberRole = await prisma.role.findFirst({ where: { name: 'member', orgId: null } });
  
  if (!ownerRole || !adminRole || !memberRole) {
    throw new Error('Roles not found. Please run RBAC seeding first.');
  }
  
  // Create default orgs for each user
  for (const [email, user] of users.entries()) {
    const existingDefaultOrg = await prisma.organization.findFirst({
      where: { ownerId: user.id, isDefault: true }
    });
    
    if (!existingDefaultOrg) {
      const defaultOrg = await prisma.organization.create({
        data: {
          name: `${user.name}'s Workspace`,
          slug: `${email.split('@')[0]}-workspace`,
          isDefault: true,
          ownerId: user.id,
          settings: {
            theme: 'light',
            language: 'en'
          },
          members: {
            create: {
              userId: user.id,
              roleId: ownerRole.id
            }
          }
        }
      });
      console.log(`✅ Created default org for ${user.email}: ${defaultOrg.name}`);
    }
  }
  
  // Create shared organizations
  const owner = users.get('owner@example.com');
  const admin = users.get('admin@example.com');
  const member = users.get('member@example.com');
  const alice = users.get('alice@example.com');
  
  // Check if "Acme Corp" exists
  let acmeOrg = await prisma.organization.findFirst({
    where: { slug: 'acme-corp' }
  });
  
  if (!acmeOrg && owner) {
    acmeOrg = await prisma.organization.create({
      data: {
        name: 'Acme Corporation',
        slug: 'acme-corp',
        isDefault: false,
        ownerId: owner.id,
        settings: {
          theme: 'dark',
          language: 'en',
          industry: 'Technology',
          size: '50-100'
        }
      }
    });
    
    // Add members with different roles
    await prisma.organizationMember.createMany({
      data: [
        { orgId: acmeOrg.id, userId: owner.id, roleId: ownerRole.id },
        { orgId: acmeOrg.id, userId: admin.id, roleId: adminRole.id },
        { orgId: acmeOrg.id, userId: member.id, roleId: memberRole.id },
        { orgId: acmeOrg.id, userId: alice.id, roleId: memberRole.id },
      ],
      skipDuplicates: true
    });
    
    console.log('✅ Created Acme Corporation with 4 members');
  }
  
  // Create another test org
  let startupOrg = await prisma.organization.findFirst({
    where: { slug: 'startup-inc' }
  });
  
  if (!startupOrg && alice) {
    startupOrg = await prisma.organization.create({
      data: {
        name: 'Startup Inc',
        slug: 'startup-inc',
        isDefault: false,
        ownerId: alice.id,
        settings: {
          theme: 'light',
          language: 'en',
          industry: 'SaaS',
          size: '10-50'
        }
      }
    });
    
    await prisma.organizationMember.createMany({
      data: [
        { orgId: startupOrg.id, userId: alice.id, roleId: ownerRole.id },
        { orgId: startupOrg.id, userId: admin.id, roleId: adminRole.id },
      ],
      skipDuplicates: true
    });
    
    console.log('✅ Created Startup Inc with 2 members');
  }
  
  return { acmeOrg, startupOrg };
}

async function seedInvitations(orgs: any) {
  console.log('💌 Seeding invitations...');
  
  const memberRole = await prisma.role.findFirst({ where: { name: 'member', orgId: null } });
  const owner = await prisma.user.findUnique({ where: { email: 'owner@example.com' } });
  
  if (!orgs.acmeOrg || !memberRole || !owner) {
    console.log('⚠️  Skipping invitations - missing required data');
    return;
  }
  
  // Create some pending invitations
  const invitations = [
    { email: 'pending1@example.com', orgId: orgs.acmeOrg.id, roleId: memberRole.id },
    { email: 'pending2@example.com', orgId: orgs.acmeOrg.id, roleId: memberRole.id },
  ];
  
  for (const inv of invitations) {
    const existing = await prisma.orgInvitation.findFirst({
      where: {
        email: inv.email,
        orgId: inv.orgId,
        acceptedAt: null
      }
    });
    
    if (!existing) {
      const token = Buffer.from(`${inv.email}-${Date.now()}`).toString('base64');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      await prisma.orgInvitation.create({
        data: {
          ...inv,
          token,
          invitedById: owner.id,
          expiresAt
        }
      });
      console.log(`✅ Created invitation for ${inv.email}`);
    }
  }
}

async function seedAuditLogs(users: Map<string, any>, orgs: any) {
  console.log('📋 Seeding audit logs...');
  
  const owner = users.get('owner@example.com');
  const admin = users.get('admin@example.com');
  
  if (!owner || !admin || !orgs.acmeOrg) {
    console.log('⚠️  Skipping audit logs - missing required data');
    return;
  }
  
  const auditEntries = [
    {
      userId: owner.id,
      orgId: orgs.acmeOrg.id,
      action: 'organization_created',
      details: { name: 'Acme Corporation', timestamp: new Date().toISOString() }
    },
    {
      userId: owner.id,
      orgId: orgs.acmeOrg.id,
      action: 'member_invited',
      details: { email: 'admin@example.com', role: 'admin', timestamp: new Date().toISOString() }
    },
    {
      userId: admin.id,
      orgId: orgs.acmeOrg.id,
      action: 'organization_updated',
      details: { changes: { theme: 'dark' }, timestamp: new Date().toISOString() }
    },
  ];
  
  for (const entry of auditEntries) {
    const existing = await prisma.auditLog.findFirst({
      where: {
        userId: entry.userId,
        action: entry.action,
        orgId: entry.orgId
      }
    });
    
    if (!existing) {
      await prisma.auditLog.create({ data: entry });
    }
  }
  
  console.log(`✅ Created ${auditEntries.length} audit log entries`);
}

async function main() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    // 1. Seed RBAC permissions and roles
    await seedRBACPermissions();
    
    // 2. Seed feature flags
    await seedFeatureFlags();
    
    // 3. Seed test users
    const users = await seedTestUsers();
    
    // 4. Seed organizations and memberships
    const orgs = await seedOrganizations(users);
    
    // 5. Seed invitations
    await seedInvitations(orgs);
    
    // 6. Seed audit logs
    await seedAuditLogs(users, orgs);
    
    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📚 Test Credentials:');
    console.log('  Owner:  owner@example.com / Owner123!');
    console.log('  Admin:  admin@example.com / Admin123!');
    console.log('  Member: member@example.com / Member123!');
    console.log('  Alice:  alice@example.com / Alice123!');
    console.log('  MVP:    mvp@example.com / Pwd123!');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
