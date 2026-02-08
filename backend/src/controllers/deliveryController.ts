import { Request, Response } from 'express'
import * as env from '../config/env.config'

const distance = (lat1: number, lon1: number, lat2: number, lon2: number, unit: 'K' | 'M'): number => {
  const radlat1 = (Math.PI * lat1) / 180
  const radlat2 = (Math.PI * lat2) / 180
  const theta = lon1 - lon2
  const radtheta = (Math.PI * theta) / 180
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
  dist = Math.acos(dist)
  dist = (dist * 180) / Math.PI
  dist = dist * 60 * 1.1515
  if (unit === 'K') {
    dist *= 1.609344
  } else if (unit === 'M') {
    dist *= 0.8684
  }
  return dist
}

export const calculateDeliveryPrice = async (req: Request, res: Response) => {
  try {
    const { pickupLocationId, address } = req.body

    if (!pickupLocationId || !address || !address.latitude || !address.longitude) {
      return res.status(400).send('Invalid request')
    }

    const DeliveryLocation = (await import('../models/Location')).default
    const Location = await DeliveryLocation.findById(pickupLocationId)

    if (!Location || !Location.latitude || !Location.longitude) {
      return res.status(400).send('Invalid pickup location')
    }

    const _distance = distance(
      Location.latitude,
      Location.longitude,
      address.latitude,
      address.longitude,
      'K',
    )

    const price = Math.max(_distance * env.DELIVERY_BASE_RATE, env.DELIVERY_MIN_FEE)

    res.status(200).json(price)
  } catch (err) {
    console.error('Error calculating delivery price:', err)
    res.status(500).send('Error calculating delivery price')
  }
}
