import uppercaseFirstLetter from './uppercaseFirstLetter'

const getRoleHumanizedName = (role: string): string => {
  if (role === 'super_admin') {
    return 'Super Admin'
  }

  return uppercaseFirstLetter(role)
}

export default getRoleHumanizedName
