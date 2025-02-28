export enum CapacityType {
  Fabric = 'Fabric',
  PowerBIDedicated = 'PowerBIDedicated'
}

export enum CapacityTypeLabel {
  Fabric = 'Fabric',
  PowerBIDedicated = 'Power BI Dedicated'
}

const capacityAPIVersions = {
  [CapacityType.Fabric]: '2023-11-01',
  [CapacityType.PowerBIDedicated]: '2021-01-01'
}

export const getCapacityAPIVersion = (type: CapacityType): string => {
  return capacityAPIVersions[type]
}
