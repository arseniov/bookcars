import LocalizedStrings from 'localized-strings'
import env from '@/config/env.config'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    CREATE_SUPPLIER_HEADING: 'Nouveau fournisseur',
    INVALID_SUPPLIER_NAME: 'Ce fournisseur existe déjà.',
    SUPPLIER_IMAGE_SIZE_ERROR: `L'image doit être au format ${env.SUPPLIER_IMAGE_WIDTH}x${env.SUPPLIER_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Taille d'image recommandée : ${env.SUPPLIER_IMAGE_WIDTH}x${env.SUPPLIER_IMAGE_HEIGHT}`,
    RENTAL_AGREEMENT: 'Accord de location',
    RENTAL_AGREEMENT_ENABLED: 'Activer l\'accord de location',
    RENTAL_AGREEMENT_CONTENT: 'Contenu de l\'accord de location (HTML)',
  },
  en: {
    CREATE_SUPPLIER_HEADING: 'New supplier',
    INVALID_SUPPLIER_NAME: 'This supplier already exists.',
    SUPPLIER_IMAGE_SIZE_ERROR: `The image must be in the format ${env.SUPPLIER_IMAGE_WIDTH}x${env.SUPPLIER_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Recommended image size: ${env.SUPPLIER_IMAGE_WIDTH}x${env.SUPPLIER_IMAGE_HEIGHT}`,
    RENTAL_AGREEMENT: 'Rental Agreement',
    RENTAL_AGREEMENT_ENABLED: 'Enable rental agreement',
    RENTAL_AGREEMENT_CONTENT: 'Rental agreement content (HTML)',
  },
  es: {
    CREATE_SUPPLIER_HEADING: 'Nuevo proveedor',
    INVALID_SUPPLIER_NAME: 'Este proveedor ya existe.',
    SUPPLIER_IMAGE_SIZE_ERROR: `La imagen debe tener el formato ${env.SUPPLIER_IMAGE_WIDTH}x${env.SUPPLIER_IMAGE_HEIGHT}`,
    RECOMMENDED_IMAGE_SIZE: `Tamaño de imagen recomendado: ${env.SUPPLIER_IMAGE_WIDTH}x${env.SUPPLIER_IMAGE_HEIGHT}`,
    RENTAL_AGREEMENT: 'Contrato de Alquiler',
    RENTAL_AGREEMENT_ENABLED: 'Habilitar contrato de alquiler',
    RENTAL_AGREEMENT_CONTENT: 'Contenido del contrato de alquiler (HTML)',
  },
})

langHelper.setLanguage(strings)
export { strings }
