import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    CATEGORY_TITLE: 'Catégorie',
    CARS_AVAILABLE: 'voitures disponibles',
    NO_CARS: 'Aucune voiture disponible pour cette catégorie avec les critères sélectionnés.',
  },
  en: {
    CATEGORY_TITLE: 'Category',
    CARS_AVAILABLE: 'cars available',
    NO_CARS: 'No cars available for this category with the selected criteria.',
  },
  es: {
    CATEGORY_TITLE: 'Categoría',
    CARS_AVAILABLE: 'coches disponibles',
    NO_CARS: 'No hay coches disponibles para esta categoría con los criterios seleccionados.',
  },
})

langHelper.setLanguage(strings)
export { strings }
