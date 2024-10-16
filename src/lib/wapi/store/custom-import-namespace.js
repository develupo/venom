export function customImportNamespace(moduleName) {
  try {
    return self.importNamespace(moduleName)
  } catch (error) {
    console.error('Error on importNamespace: ', error)
  }
}
