import type { Role } from '@prisma/client';

/**
 * Central role-based access rules (spec §5). These are used server-side in
 * every mutation and query — NEVER trust the client for authorization.
 */
export type Permission =
  | 'user:manage'
  | 'customer:write'
  | 'plot:write'
  | 'project:write'
  | 'sale:write'
  | 'payment:record'
  | 'payment:void'
  | 'content:write'
  | 'report:read';

const MATRIX: Record<Role, Permission[]> = {
  // ADMIN can do everything incl. void payments, manage users, edit company/project content.
  ADMIN: [
    'user:manage',
    'customer:write',
    'plot:write',
    'project:write',
    'sale:write',
    'payment:record',
    'payment:void',
    'content:write',
    'report:read',
  ],
  // STAFF: plots/customers/sales; record payments. NOT void, NOT users, NOT company content.
  STAFF: ['customer:write', 'plot:write', 'project:write', 'sale:write', 'payment:record', 'report:read'],
  CUSTOMER: [],
};

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return MATRIX[role].includes(permission);
}

export function isStaff(role: Role | undefined | null): boolean {
  return role === 'ADMIN' || role === 'STAFF';
}
