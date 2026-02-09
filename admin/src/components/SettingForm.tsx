import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FormControl, FormHelperText, Input, InputLabel, Paper, Switch, FormControlLabel } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'
import { strings as settingsStrings } from '@/lang/settings'
import { strings } from '@/lang/setting'
import * as SettingService from '@/services/SettingService'
import * as helper from '@/utils/helper'
import { schema, FormFields } from '@/models/SettingForm'

interface SettingFormProps {
  settings: bookcarsTypes.Setting | null
  onSubmit: (data: bookcarsTypes.Setting) => void
}

const SettingForm = ({ settings, onSubmit: onFormSubmit }: SettingFormProps) => {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { isSubmitting, errors }, setValue, watch } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  })

  const dualBookingFlowEnabled = watch('dualBookingFlowEnabled')
  const rentalAgreementEnabled = watch('rentalAgreementEnabled')
  const deliveryOptionEnabled = watch('deliveryOptionEnabled')

  useEffect(() => {
    if (settings) {
      setValue('minPickupHours', settings.minPickupHours.toString())
      setValue('minRentalHours', settings.minRentalHours.toString())
      setValue('minPickupDropoffHour', settings.minPickupDropoffHour.toString())
      setValue('maxPickupDropoffHour', settings.maxPickupDropoffHour.toString())
      setValue('dualBookingFlowEnabled', settings.dualBookingFlowEnabled || false)
      setValue('rentalAgreementEnabled', settings.rentalAgreementEnabled || false)
      setValue('rentalAgreementContent', settings.rentalAgreementContent || '')
      setValue('deliveryOptionEnabled', settings.deliveryOptionEnabled || false)
      setValue('deliveryBaseRate', (settings.deliveryBaseRate || 2).toString())
      setValue('deliveryMinFee', (settings.deliveryMinFee || 10).toString())
    }
  }, [settings, setValue])

  const onSubmit = async (data: FormFields) => {
    try {
      const payload: bookcarsTypes.UpdateSettingsPayload = {
        minPickupHours: Number(data.minPickupHours),
        minRentalHours: Number(data.minRentalHours),
        minPickupDropoffHour: Number(data.minPickupDropoffHour),
        maxPickupDropoffHour: Number(data.maxPickupDropoffHour),
        dualBookingFlowEnabled: data.dualBookingFlowEnabled,
        rentalAgreementEnabled: data.rentalAgreementEnabled,
        rentalAgreementContent: data.rentalAgreementContent,
        deliveryOptionEnabled: data.deliveryOptionEnabled,
        deliveryBaseRate: Number(data.deliveryBaseRate),
        deliveryMinFee: Number(data.deliveryMinFee),
      }

      const { status, data: res } = await SettingService.updateSettings(payload)

      if (status === 200) {
        if (onFormSubmit) {
          onFormSubmit(res)
        }
        helper.info(settingsStrings.SETTINGS_UPDATED)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  return (
    <Paper className="settings-form settings-form-wrapper" elevation={10}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="settings-form-title">{strings.SETTINGS}</h1>

        <FormControl fullWidth margin="dense">
          <InputLabel className="required">{strings.MIN_PICKUP_HOURS}</InputLabel>
          <Input {...register('minPickupHours')} type="text" required autoComplete="off" />
          {errors.minPickupHours && (
            <FormHelperText error>{errors.minPickupHours.message}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="required">{strings.MIN_RENTAL_HOURS}</InputLabel>
          <Input {...register('minRentalHours')} type="text" required autoComplete="off" />
          {errors.minRentalHours && (
            <FormHelperText error>{errors.minRentalHours.message}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="required">{strings.MIN_PICKUP_DROPOFF_HOUR}</InputLabel>
          <Input {...register('minPickupDropoffHour')} type="text" required autoComplete="off" />
          {errors.minPickupDropoffHour && (
            <FormHelperText error>{errors.minPickupDropoffHour.message}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel className="required">{strings.MAX_PICKUP_DROPOFF_HOUR}</InputLabel>
          <Input {...register('maxPickupDropoffHour')} type="text" required autoComplete="off" />
          {errors.maxPickupDropoffHour && (
            <FormHelperText error>{errors.maxPickupDropoffHour.message}</FormHelperText>
          )}
        </FormControl>

        <h2 className="settings-form-subtitle">{strings.FEATURE_FLAGS}</h2>

        <FormControl fullWidth margin="dense">
          <Controller
            name="dualBookingFlowEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={strings.DUAL_BOOKING_FLOW}
              />
            )}
          />
        </FormControl>

        <FormControl fullWidth margin="dense">
          <Controller
            name="rentalAgreementEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={strings.RENTAL_AGREEMENT}
              />
            )}
          />
        </FormControl>

        {rentalAgreementEnabled && (
          <FormControl fullWidth margin="dense">
            <InputLabel>{strings.RENTAL_AGREEMENT_CONTENT}</InputLabel>
            <Input {...register('rentalAgreementContent')} type="text" multiline rows={4} autoComplete="off" />
          </FormControl>
        )}

        <FormControl fullWidth margin="dense">
          <Controller
            name="deliveryOptionEnabled"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label={strings.DELIVERY_OPTION}
              />
            )}
          />
        </FormControl>

        {deliveryOptionEnabled && (
          <>
            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{strings.DELIVERY_BASE_RATE}</InputLabel>
              <Input {...register('deliveryBaseRate')} type="text" required autoComplete="off" />
              {errors.deliveryBaseRate && (
                <FormHelperText error>{errors.deliveryBaseRate.message}</FormHelperText>
              )}
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel className="required">{strings.DELIVERY_MIN_FEE}</InputLabel>
              <Input {...register('deliveryMinFee')} type="text" required autoComplete="off" />
              {errors.deliveryMinFee && (
                <FormHelperText error>{errors.deliveryMinFee.message}</FormHelperText>
              )}
            </FormControl>
          </>
        )}

        <div className="buttons">
          <Button type="submit" variant="contained" className="btn-primary btn-margin-bottom" size="small" disabled={isSubmitting}>
            {commonStrings.SAVE}
          </Button>
          <Button variant="contained" className="btn-secondary btn-margin-bottom" size="small" onClick={() => navigate('/')}>
            {commonStrings.CANCEL}
          </Button>
        </div>
      </form>
    </Paper>
  )
}

export default SettingForm
