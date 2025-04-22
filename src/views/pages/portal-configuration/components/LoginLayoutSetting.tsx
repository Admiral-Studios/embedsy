// ** Custom Component Import
import SelectSetting, { SelectSettingProps } from './SelectSetting'

// ** Types
import type { AppPortalSettings } from 'src/@core/context/settingsContext'

const loginLayoutOptions: Array<{ label: string; value: AppPortalSettings['login_layout'] }> = [
  {
    label: 'Image left, login right',
    value: 'IMAGE LEFT, LOGIN RIGHT'
  },
  {
    label: 'Login left, image right',
    value: 'LOGIN LEFT, IMAGE RIGHT'
  }
]

const LoginLayoutSetting = (props: Omit<SelectSettingProps, 'options'>) => {
  return <SelectSetting {...props} options={loginLayoutOptions as any} />
}

export default LoginLayoutSetting
