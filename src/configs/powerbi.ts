import { models } from 'powerbi-client'

export const powerBiConfigSettings = {
  navContentPaneEnabled: false,
  layoutType: models.LayoutType.Master,
  customLayout: {
    displayOption: models.DisplayOption.FitToWidth
  }
}
