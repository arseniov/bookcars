import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Convention de Location',
    ACCEPT_LABEL: 'J\'ai lu et j\'accepte les conditions de location.',
    ACCEPT: 'Accepter',
    CANCEL: 'Annuler',
    LOAD_ERROR: 'Une erreur est survenue lors du chargement du contrat de location.',
    NO_CONTENT: 'Aucun contenu de contrat de location n\'a été configuré.',
  },
  en: {
    TITLE: 'Rental Agreement',
    ACCEPT_LABEL: 'I have read and accept the rental terms and conditions.',
    ACCEPT: 'Accept',
    CANCEL: 'Cancel',
    LOAD_ERROR: 'An error occurred while loading the rental agreement.',
    NO_CONTENT: 'No rental agreement content has been configured.',
  },
  es: {
    TITLE: 'Contrato de Alquiler',
    ACCEPT_LABEL: 'He leído y acepto los términos y condiciones del alquiler.',
    ACCEPT: 'Aceptar',
    CANCEL: 'Cancelar',
    LOAD_ERROR: 'Se produjo un error al cargar el contrato de alquiler.',
    NO_CONTENT: 'No se ha configurado contenido del contrato de alquiler.',
  },
})

langHelper.setLanguage(strings)
export { strings }
