import { AbilityBuilder, Ability } from '@casl/ability'
import { SubjectTypes } from 'src/types/acl/subjectTypes'
import { PermanentRoles } from 'src/context/types'

export type Subjects = string
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = Ability<[Actions, Subjects]> | undefined

export const AppAbility = Ability as any
export type ACLObj = {
  action: Actions
  subject: string
}

const memberAbilities = [
  SubjectTypes.AclPage,
  SubjectTypes.ReportIdPage,
  SubjectTypes.IframeIdPage,
  SubjectTypes.ProfilePage,
  SubjectTypes.ApplicationStateErrorPage
]

const guestAbilities = [SubjectTypes.AclPage, SubjectTypes.ProfilePage, SubjectTypes.ApplicationStateErrorPage]

const canRefreshAbilities = [SubjectTypes.UserConfiguration]

/**
 * Please define your own Ability rules according to your app requirements.
 * We have just shown Admin and Client rules for demo purpose where
 * admin can manage everything and client can just visit ACL page
 */
// eslint-disable-next-line
const defineRulesFor = (role: string, _: string, canRefresh?: boolean) => {
  const { can, rules } = new AbilityBuilder(AppAbility)

  switch (role) {
    case PermanentRoles.super_admin:
      can('manage', 'all')
    case PermanentRoles.admin:
      can('manage', 'all')
      break
    case PermanentRoles.guest:
      guestAbilities.forEach(subject => can(['read'], subject))
      break
    default:
      memberAbilities.forEach(subject => can(['read'], subject))
      if (canRefresh) {
        canRefreshAbilities.forEach(subject => can(['manage'], subject))
      }
      break
  }

  return rules
}

export const buildAbilityFor = (role: string, subject: string, canRefresh?: boolean): AppAbility => {
  return new AppAbility(defineRulesFor(role, subject, canRefresh), {
    // https://casl.js.org/v5/en/guide/subject-type-detection
    // @ts-ignore
    detectSubjectType: object => object!.type
  })
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all'
}

export default defineRulesFor
