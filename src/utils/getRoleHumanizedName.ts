const getRoleHumanizedName = (role: string): string => {
  if (role === 'super_admin') {
    return 'Super Admin'
  }

  if (role === 'admin') {
    return 'Admin'
  }

  if (role === 'guest') {
    return 'Guest'
  }

  return role
}

export default getRoleHumanizedName
