import React, { useState, useEffect } from 'react'
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Box,
  Typography,
  FormHelperText,
  Button,
} from '@mui/material'
import { strings } from '@/lang/delivery-option'
import env from '@/config/env.config'
import * as PaymentService from '@/services/PaymentService'
import * as LocationService from '@/services/LocationService'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'

interface DeliveryOptionProps {
  value: 'pickup' | 'delivery'
  onChange: (value: 'pickup' | 'delivery', address?: bookcarsTypes.DeliveryAddress, price?: number) => void
  pickupLocationId: string
  error?: string
  car?: bookcarsTypes.Car
  rentalPrice: number
}

const DeliveryOption = ({
  value,
  onChange,
  pickupLocationId,
  error,
  car,
  rentalPrice,
}: DeliveryOptionProps) => {
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0)
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location>()

  const canBeDelivered = car?.canBeDelivered ?? true
  const deliveryBasePrice = car?.deliveryBasePrice ?? env.DELIVERY_BASE_PRICE
  const deliveryPercentagePrice = car?.deliveryPercentagePrice ?? env.DELIVERY_PERCENTAGE_PRICE

  useEffect(() => {
    const fetchPickupLocation = async () => {
      try {
        const location = await LocationService.getLocation(pickupLocationId)
        setPickupLocation(location)
      } catch (err) {
        console.error('Failed to fetch pickup location:', err)
      }
    }

    if (pickupLocationId) {
      fetchPickupLocation()
    }
  }, [pickupLocationId])

  const handleDeliveryChange = (newValue: 'pickup' | 'delivery') => {
    if (newValue === 'pickup') {
      onChange('pickup')
      setDeliveryPrice(0)
    } else {
      onChange('delivery', { street, city, zipCode, country }, deliveryPrice)
    }
  }

  const handleCalculatePrice = async () => {
    if (!street || !city) {
      return
    }

    setLoading(true)
    try {
      const address: bookcarsTypes.DeliveryAddress = {
        street,
        city,
        zipCode,
        country,
      }

      const percentageFee = (rentalPrice * deliveryPercentagePrice) / 100
      const calculatedPrice = Math.max(percentageFee, deliveryBasePrice)

      setDeliveryPrice(calculatedPrice)
      onChange('delivery', address, calculatedPrice)
    } catch (err) {
      console.error('Failed to calculate delivery price:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (field: string, fieldValue: string) => {
    if (field === 'street') setStreet(fieldValue)
    if (field === 'city') setCity(fieldValue)
    if (field === 'zipCode') setZipCode(fieldValue)
    if (field === 'country') setCountry(fieldValue)
  }

  return (
    <Box className="delivery-option">
      <Typography variant="h6" className="delivery-option-title">
        {strings.TITLE}
      </Typography>

      <RadioGroup
        value={value}
        onChange={(e) => handleDeliveryChange(e.target.value as 'pickup' | 'delivery')}
      >
        <FormControlLabel
          value="pickup"
          control={<Radio />}
          label={
            <Box className="delivery-option-label">
              <Typography variant="body1">{strings.PICKUP_OPTION}</Typography>
              <Typography variant="body2" color="textSecondary">
                {strings.PICKUP_DESCRIPTION}
              </Typography>
            </Box>
          }
        />

        {canBeDelivered && (
          <FormControlLabel
            value="delivery"
            control={<Radio />}
            label={
              <Box className="delivery-option-label">
                <Typography variant="body1">{strings.DELIVERY_OPTION}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {strings.DELIVERY_DESCRIPTION}
                </Typography>
              </Box>
            }
          />
        )}
      </RadioGroup>

      {canBeDelivered && value === 'delivery' && (
        <Box className="delivery-address-form">
          <TextField
            fullWidth
            label={strings.STREET_LABEL}
            variant="outlined"
            margin="dense"
            value={street}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label={strings.CITY_LABEL}
            variant="outlined"
            margin="dense"
            value={city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label={strings.ZIP_CODE_LABEL}
            variant="outlined"
            margin="dense"
            value={zipCode}
            onChange={(e) => handleFieldChange('zipCode', e.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label={strings.COUNTRY_LABEL}
            variant="outlined"
            margin="dense"
            value={country}
            onChange={(e) => handleFieldChange('country', e.target.value)}
            disabled={loading}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleCalculatePrice}
            disabled={loading || !street || !city}
            sx={{ mt: 2 }}
          >
            {loading ? strings.CALCULATING : strings.CALCULATE}
          </Button>

          {deliveryPrice > 0 && (
            <Box className="delivery-price">
              <Typography variant="body1">
                {strings.DELIVERY_FEE}
              </Typography>
              <Typography variant="h6" color="primary">
                {bookcarsHelper.formatPrice(deliveryPrice, strings.CURRENCY, env.DEFAULT_LANGUAGE)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                ({deliveryPercentagePrice}% of rental fee = {bookcarsHelper.formatPrice((rentalPrice * deliveryPercentagePrice) / 100, strings.CURRENCY, env.DEFAULT_LANGUAGE)})
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {error && (
        <FormHelperText error>{error}</FormHelperText>
      )}
    </Box>
  )
}

export default DeliveryOption
