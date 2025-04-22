export type SlackUserProfile = {
  avatar_hash: string
  display_name: string
  display_name_normalized: string
  email: string
  image_original: string
  real_name: string
  real_name_normalized: string
}

export type SlackUser = {
  deleted: boolean
  id: string
  is_admin: boolean
  is_app_user: boolean
  is_bot: boolean
  is_owner: boolean
  is_primary_owner: boolean
  is_restricted: boolean
  is_ultra_restricted: boolean
  name: string
  profile: SlackUserProfile
  raw_json?: string
  team_id: string
  tz: string
  tz_label: string
  tz_offset: number
  updated: number
}

export type SlackChannel = {
  id: string
  name: string
  name_normalized: string
  created: number
  creator: string
  is_archived: boolean
  is_channel: boolean
  is_general: boolean
  is_group: boolean
  is_im: boolean
  is_mpim: boolean
  is_private: boolean
  is_shared: boolean
  num_members: number
  updated: number
  raw_json?: string
  topic?: {
    value: string
    creator: string
    last_set: number
  }
  purpose?: {
    value: string
    creator: string
    last_set: number
  }
  properties?: {
    canvas?: {
      file_id: string
      is_empty: boolean
      quip_thread_id?: string
    }
    use_case?: string
  }
  shared_team_ids?: string[]
  previous_names?: string[]
}
