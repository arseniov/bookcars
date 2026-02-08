import * as bookcarsTypes from ':bookcars-types'
import { CarRange } from ':bookcars-types'

export const categories: bookcarsTypes.Category[] = [
  { id: 'mini', name: 'Small Cars', carRange: CarRange.Mini, description: 'Compact and fuel-efficient vehicles perfect for city driving.' },
  { id: 'midi', name: 'SUVs', carRange: CarRange.Midi, description: 'Spacious and versatile vehicles for family adventures.' },
  { id: 'maxi', name: 'Vans', carRange: CarRange.Maxi, description: 'Large vehicles for group travel or cargo transport.' },
  { id: 'scooter', name: 'Scooters', carRange: CarRange.Scooter, description: 'Quick and agile two-wheeled vehicles for urban mobility.' },
  { id: 'bus', name: 'Buses', carRange: CarRange.Bus, description: 'Large passenger vehicles for group transportation.' },
  { id: 'truck', name: 'Trucks', carRange: CarRange.Truck, description: 'Heavy-duty vehicles for cargo and utility purposes.' },
  { id: 'caravan', name: 'Caravans', carRange: CarRange.Caravan, description: 'Mobile homes and recreational vehicles for travel.' },
]

export const getCategory = (id: string): bookcarsTypes.Category | undefined => {
  return categories.find(c => c.id === id)
}

export const getAllCategories = (): bookcarsTypes.Category[] => {
  return categories
}
