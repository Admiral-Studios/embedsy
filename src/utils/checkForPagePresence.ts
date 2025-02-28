import { PageType } from 'src/types/types'

type CheckedPageType = {
  report_id: string | null
  workspace_id: string | null
  preview_pages: boolean
  dataset_id: string | null
  type: string | null
  iframe_html: string | null
  iframe_title: string | null
  role_id: number
}

const acceptedPrimitiveKeys: Array<keyof CheckedPageType | keyof PageType> = [
  'report_id',
  'workspace_id',
  'preview_pages',
  'dataset_id',
  'type'
]

const isPageDuplicate = (checkedPage: CheckedPageType, existingPage: PageType): boolean => {
  const isMatchingPrimitiveKeys = acceptedPrimitiveKeys.every(
    key =>
      !(key in checkedPage || key in existingPage) ||
      checkedPage[key as keyof CheckedPageType] === existingPage[key as keyof PageType]
  )

  const hasMatchingRole = existingPage.roles?.some(({ id }) => id === checkedPage.role_id) ?? false

  return isMatchingPrimitiveKeys && hasMatchingRole
}

export const checkForPagePresence = (checkedPage: CheckedPageType, existingPages: PageType[]) =>
  existingPages.some(page => isPageDuplicate(checkedPage, page))
