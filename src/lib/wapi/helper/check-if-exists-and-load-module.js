import { WHATSAPP_MODULES_NAMES } from '../constants/whatsapp-modules-names'
import { filterObjects } from './filter-object'

export function checkIfExistsAndLoadModule(keyStore) {
  if (Store[keyStore]) {
    return Store[keyStore]
  }
  const filterObject = filterObjects.find((obj) => obj.type === keyStore)

  const moduleTarget = filterObject.when(
    self.importNamespace(WHATSAPP_MODULES_NAMES[keyStore])
  )

  if (!moduleTarget)
    throw new Error(`Module: ${WHATSAPP_MODULES_NAMES[keyStore]} not found`)

  Store[keyStore] = moduleTarget

  return Store[keyStore]
}
