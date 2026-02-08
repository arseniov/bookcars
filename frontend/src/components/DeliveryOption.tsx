import React, { useState, useEffect } from 'react'
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Box,
  Typography,
  FormHelperText,
  CircularProgress,
} from '@mui/material'
import { useForm, useWatch } from 'react-hook-form'
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
}

interface DeliveryFormFields {
  street: string
  city: string
  zipCode: string
  country: string
}

const DeliveryOption = ({
  value,
  onChange,
  pickupLocationId,
  error,
}: DeliveryOptionProps) => {
  const [loading, setLoading] = useState(false)
  const [deliveryPrice, setDeliveryPrice] = useState<number>(0)
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location>()

  const { control, setValue, formState: { errors } } = useForm<DeliveryFormFields>({
    mode: 'onBlur',
  })

  const street = useWatch({ control, name: 'street' })
  const city = useWatch({ control, name: 'city' })
  const zipCode = useWatch({ control, name: 'zipCode' })
  const country = useWatch({ control, name: 'country' })

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

  useEffect(() => {
    if (value === 'pickup') {
      onChange('pickup')
    }
  }, [value])

  const handleDeliveryChange = async (newValue: 'pickup' | 'delivery') => {
    if (newValue === 'delivery') {
      setLoading(true)
      try {
        const address: bookcarsTypes.DeliveryAddress = {
          street: street || '',
          city: city || '',
          zipCode: zipCode || '',
          country: country || '',
        }

        if (street && city && pickupLocation) {
          const price = await PaymentService.calculateDeliveryPrice(pickupLocationId, address)
          setDeliveryPrice(price)
          onChange('delivery', address, price)
        } else {
          onChange('delivery', address, 0)
        }
      } catch (err) {
        console.error('Failed to calculate delivery price:', err)
        onChange('delivery', { street: '', city: '', zipCode: '', country: '' }, 0)
      } finally {
        setLoading(false)
      }
    } else {
      onChange('pickup')
      setDeliveryPrice(0)
    }
  }

  const handleAddressChange = async (field: string, fieldValue: string) => {
    setValue(field as keyof DeliveryFormFields, fieldValue)

    if (street && city && pickupLocation) {
      setLoading(true)
      try {
        const address: bookcarsTypes.DeliveryAddress = {
          street,
          city,
          zipCode,
          country,
        }
        const price = await PaymentService.calculateDeliveryPrice(pickupLocationId, address)
        setDeliveryPrice(price)
        onChange('delivery', address, price)
      } catch (err) {
        console.error('Failed to calculate delivery price:', err)
      } finally {
        setLoading(false)
      }
    }
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
      </RadioGroup>

      {value === 'delivery' && (
        <Box className="delivery-address-form">
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <TextField
                {...control}
                fullWidth
                label={strings.STREET_LABEL}
                variant="outlined"
                margin="dense"
                value={street || ''}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                error={!!errors.street}
                helperText={errors.street?.message}
              />

              <TextField
                {...control}
                fullWidth
                label={strings.CITY_LABEL}
                variant="outlined"
                margin="dense"
                value={city || ''}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                error={!!errors.city}
                helperText={errors.city?.message}
              />

              <TextField
                {...control}
                fullWidth
                label={strings.ZIP_CODE_LABEL}
                variant="outlined"
                margin="dense"
                value={zipCode || ''}
                onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              />

              <TextField
                {...control}
                fullWidth
                label={strings.COUNTRY_LABEL}
                variant="outlined"
                margin="dense"
                value={country || ''}
                onChange={(e) => handleAddressChange('country', e.target.value)}
              />

              {deliveryPrice > 0 && (
                <Box className="delivery-price">
                  <Typography variant="body1">
                    {strings.DELIVERY_FEE}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {bookcarsHelper.formatPrice(deliveryPrice, strings.CURRENCY, env.DEFAULT_LANGUAGE)}
                  </Typography>
                </Box>
              )}
            </>
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
