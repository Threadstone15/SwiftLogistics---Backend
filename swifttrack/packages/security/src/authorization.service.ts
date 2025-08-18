export enum Permission {
  // Order permissions
  ORDER_READ = 'order:read',
  ORDER_CREATE = 'order:create',
  ORDER_UPDATE = 'order:update',
  ORDER_DELETE = 'order:delete',
  ORDER_CONFIRM = 'order:confirm',
  ORDER_FAIL = 'order:fail',

  // Driver permissions
  DRIVER_READ = 'driver:read',
  DRIVER_UPDATE = 'driver:update',
  DRIVER_ROUTE_READ = 'driver:route:read',
  DRIVER_ROUTE_UPDATE = 'driver:route:update',
  DRIVER_LOCATION_UPDATE = 'driver:location:update',

  // Warehouse permissions
  WAREHOUSE_READ = 'warehouse:read',
  WAREHOUSE_UPDATE = 'warehouse:update',

  // Admin permissions
  ADMIN_READ = 'admin:read',
  ADMIN_WRITE = 'admin:write',
  ADMIN_REPORTS = 'admin:reports',
  ADMIN_AUDIT = 'admin:audit',

  // User management
  USER_READ = 'user:read',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
}

export enum Role {
  CLIENT = 'client',
  DRIVER = 'driver',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.CLIENT]: [
    Permission.ORDER_READ,
    Permission.ORDER_CREATE,
    Permission.ORDER_CONFIRM,
  ],
  [Role.DRIVER]: [
    Permission.ORDER_READ,
    Permission.ORDER_UPDATE,
    Permission.ORDER_FAIL,
    Permission.DRIVER_READ,
    Permission.DRIVER_UPDATE,
    Permission.DRIVER_ROUTE_READ,
    Permission.DRIVER_ROUTE_UPDATE,
    Permission.DRIVER_LOCATION_UPDATE,
    Permission.WAREHOUSE_READ,
    Permission.WAREHOUSE_UPDATE,
  ],
  [Role.ADMIN]: [
    ...Object.values(Permission),
  ],
  [Role.SYSTEM]: [
    ...Object.values(Permission),
  ],
};

export class AuthorizationService {
  static hasPermission(userRole: Role, permission: Permission): boolean {
    const rolePermissions = RolePermissions[userRole] || [];
    return rolePermissions.includes(permission);
  }

  static hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  static hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  static canAccessResource(
    userRole: Role,
    resource: string,
    action: string,
    resourceOwnerId?: number,
    requestUserId?: number
  ): boolean {
    const permission = `${resource}:${action}` as Permission;
    
    // Check if user has the required permission
    if (!this.hasPermission(userRole, permission)) {
      return false;
    }

    // For client role, check resource ownership
    if (userRole === Role.CLIENT && resourceOwnerId && requestUserId) {
      return resourceOwnerId === requestUserId;
    }

    return true;
  }
}
