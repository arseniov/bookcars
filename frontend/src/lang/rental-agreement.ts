import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Convention de Location',
    ACCEPT_LABEL: 'J\'ai lu et j\'accepte les conditions de location.',
    ACCEPT: 'Accepter',
    CANCEL: 'Annuler',
    DEFAULT_CONTENT: `
      <h2>Conditions Générales de Location</h2>
      <p>En acceptant cette convention de location, vous confirmez que :</p>
      <ul>
        <li>Vous êtes en possession d'un permis de conduire valide.</li>
        <li>Le véhicule sera utilisé uniquement à des fins personnelles.</li>
        <li>Vous respecterez toutes les règles de circulation applicables.</li>
        <li>Le véhicule sera restitué dans le même état qu'à la prise en charge.</li>
        <li>Vous êtes responsable de tout dommage causé au véhicule pendant la période de location.</li>
      </ul>
      <p><strong>Politique d'annulation :</strong> Annulation gratuite jusqu'à 48 heures avant la prise en charge.</p>
      <p><strong>Carburant :</strong> Le véhicule est fourni avec le plein de carburant et doit être restitué avec le plein.</p>
    `,
    LOAD_ERROR: 'Une erreur est survenue lors du chargement du contrat de location.',
  },
  en: {
    TITLE: 'Rental Agreement',
    ACCEPT_LABEL: 'I have read and accept the rental terms and conditions.',
    ACCEPT: 'Accept',
    CANCEL: 'Cancel',
    DEFAULT_CONTENT: `
      <h2>Rental Terms and Conditions</h2>
      <p>By accepting this rental agreement, you confirm that:</p>
      <ul>
        <li>You are in possession of a valid driver's license.</li>
        <li>The vehicle will be used for personal purposes only.</li>
        <li>You will comply with all applicable traffic regulations.</li>
        <li>The vehicle will be returned in the same condition as when picked up.</li>
        <li>You are responsible for any damage caused to the vehicle during the rental period.</li>
      </ul>
      <p><strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before pick-up.</p>
      <p><strong>Fuel:</strong> The vehicle is provided with a full tank of fuel and must be returned with a full tank.</p>
    `,
    LOAD_ERROR: 'An error occurred while loading the rental agreement.',
  },
  es: {
    TITLE: 'Contrato de Alquiler',
    ACCEPT_LABEL: 'He leído y acepto los términos y condiciones del alquiler.',
    ACCEPT: 'Aceptar',
    CANCEL: 'Cancelar',
    DEFAULT_CONTENT: `
      <h2>Términos y Condiciones de Alquiler</h2>
      <p>Al aceptar este contrato de alquiler, confirma que:</p>
      <ul>
        <li>Está en posesión de un permiso de conducir válido.</li>
        <li>El vehículo se utilizará únicamente para fines personales.</li>
        <li>Cumplirá con todas las regulaciones de tráfico aplicables.</li>
        <li>El vehículo será devuelto en las mismas condiciones que cuando fue recogido.</li>
        <li>Es responsable de cualquier daño causado al vehículo durante el período de alquiler.</li>
      </ul>
      <p><strong>Política de Cancelación:</strong> Cancelación gratuita hasta 48 horas antes de la recogida.</p>
      <p><strong>Combustible:</strong> El vehículo se proporciona con el depósito lleno y debe ser devuelto con el depósito lleno.</p>
    `,
    LOAD_ERROR: 'Se produjo un error al cargar el contrato de alquiler.',
  },
})

langHelper.setLanguage(strings)
export { strings }
