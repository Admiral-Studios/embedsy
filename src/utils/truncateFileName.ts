const truncateFileName = (name: string, count: number) => {
  return name.length > count ? name.slice(0, count) + '...' : name
}

export default truncateFileName
