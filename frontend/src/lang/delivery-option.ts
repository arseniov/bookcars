import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'
import * as PaymentService from '@/services/PaymentService'

const strings = new LocalizedStrings({
  fr: {
    TITLE: 'Option de livraison',
    PICKUP_OPTION: 'Retirer le véhicule',
    PICKUP_DESCRIPTION: 'Venez chercher le véhicule à l\'agence de location. Gratuit.',
    DELIVERY_OPTION: 'Faire livrer le véhicule',
    DELIVERY_DESCRIPTION: 'Le véhicule sera livré à l\'adresse de votre choix. Des frais supplémentaires s\'appliquent.',
    STREET_LABEL: 'Rue et numéro',
    CITY_LABEL: 'Ville',
    ZIP_CODE_LABEL: 'Code postal',
    COUNTRY_LABEL: 'Pays',
    DELIVERY_FEE: 'Frais de livraison :',
    CURRENCY: PaymentService.getCurrencySymbol(),
    CALCULATING: 'Calcul des frais de livraison...',
    ERROR: 'Erreur lors du calcul des frais de livraison.',
  },
  en: {
    TITLE: 'Delivery Option',
    PICKUP_OPTION: 'Pick up the vehicle',
    PICKUP_DESCRIPTION: 'Come pick up the vehicle at the rental location. Free.',
    DELIVERY_OPTION: 'Have the vehicle delivered',
    DELIVERY_DESCRIPTION: 'The vehicle will be delivered to your chosen address. Additional fees apply.',
    STREET_LABEL: 'Street and number',
    CITY_LABEL: 'City',
    ZIP_CODE_LABEL: 'Zip code',
    COUNTRY_LABEL: 'Country',
    DELIVERY_FEE: 'Delivery fee:',
    CURRENCY: PaymentService.getCurrencySymbol(),
    CALCULATING: 'Calculating delivery fees...',
    ERROR: 'Error calculating delivery fees.',
  },
  es: {
    TITLE: 'Opción de entrega',
    PICKUP_OPTION: 'Recoger el vehículo',
    PICKUP_DESCRIPTION: 'Venga a recoger el vehículo en la oficina de alquiler. Gratis.',
    DELIVERY_OPTION: 'Entrega del vehículo',
    DELIVERY_DESCRIPTION: 'El vehículo será entregado en la dirección que elija. Se aplican gastos adicionales.',
    STREET_LABEL: 'Calle y número',
    CITY_LABEL: 'Ciudad',
    ZIP_CODE_LABEL: 'Código postal',
    COUNTRY_LABEL: 'País',
    DELIVERY_FEE: 'Gastos de entrega:',
    CURRENCY: PaymentService.getCurrencySymbol(),
    CALCULATING: 'Calculando gastos de entrega...',
    ERROR: 'Error al calcular los gastos de entrega.',
  },
})

langHelper.setLanguage(strings)
export { strings }
