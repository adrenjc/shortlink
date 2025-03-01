import { useModel } from 'umi';

export function usePermission() {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser;

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
    currentUser.permissions?.forEach((permission: any) => {
      permissions.add(permission.code);
    });

    return permissions;
  };

  const userPermissions: any = getUserPermissions();
  const isAdmin = currentUser?.username === 'admin';

  return {
    /**
     * 检查是否有特定权限
     */
    hasPermission: (permission: string): boolean => {
      if (!currentUser) return false;
      if (isAdmin) return true;
      return userPermissions.has(permission);
    },

    /**
     * 检查是否有任意一个权限
     */
    hasAnyPermission: (permissions: string[]): boolean => {
      if (!currentUser) return false;
      if (isAdmin) return true;
      return permissions.some((permission) => userPermissions.has(permission));
    },

    /**
     * 检查是否有所有权限
     */
    hasAllPermissions: (permissions: string[]): boolean => {
      if (!currentUser) return false;
      if (isAdmin) return true;
      return permissions.every((permission) => userPermissions.has(permission));
    },

    /**
     * 是否是管理员
     */
    isAdmin,
  };
}
