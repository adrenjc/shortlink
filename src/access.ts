/**
 * @see https://umijs.org/docs/max/access#access
 *
 * 访问权限控制
 * - canAdmin: 是否是超级管理员
 * - hasPermission: 检查是否有特定权限
 * - hasAnyPermission: 检查是否有任意一个权限
 * - hasAllPermissions: 检查是否有所有权限
 */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  // 获取用户所有权限
  const getUserPermissions = () => {
    if (!currentUser) return new Set<string>();

    const permissions = new Set<string>();

    // 添加角色包含的权限
    currentUser.roles?.forEach((role: any) => {
      role.permissions?.forEach((permission: any) => {
        permissions.add(permission.code);
      });
    });

    // 添加直接分配给用户的权限
    currentUser?.permissions?.forEach((permission: any) => {
      permissions.add(permission.code);
    });

    return permissions;
  };

  const userPermissions = getUserPermissions();

  return {
    // 是否是超级管理员
    canAdmin: currentUser && currentUser.username === 'admin',

    // 检查是否有特定权限
    hasPermission: (permission: string) => {
      if (!currentUser) return false;
      if (currentUser.username === 'admin') return true;
      return userPermissions.has(permission);
    },

    // 检查是否有任意一个权限
    hasAnyPermission: (permissions: string[]) => {
      if (!currentUser) return false;
      if (currentUser.username === 'admin') return true;
      return permissions.some((permission) => userPermissions.has(permission));
    },

    // 检查是否有所有权限
    hasAllPermissions: (permissions: string[]) => {
      if (!currentUser) return false;
      if (currentUser.username === 'admin') return true;
      return permissions.every((permission) => userPermissions.has(permission));
    },
  };
}
