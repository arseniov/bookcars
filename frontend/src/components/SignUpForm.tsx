import React, { useState } from 'react'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Box,
  Typography,
  Checkbox,
  Link,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import * as helper from '@/utils/helper'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-up'
import * as UserService from '@/services/UserService'
import { useUserContext, UserContextType } from '@/context/UserContext'
import { useRecaptchaContext, RecaptchaContextType } from '@/context/RecaptchaContext'
import PasswordInput from '@/components/PasswordInput'
import SocialLogin from '@/components/SocialLogin'
import Error from '@/components/Error'
import DatePicker from '@/components/DatePicker'
import OtpVerification from '@/components/OtpVerification'
import { schema, FormFields } from '@/models/SignUpForm'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

const SignUpForm = ({ onSuccess, onSwitchToSignIn }: SignUpFormProps) => {
  const { setUser, setUserLoaded } = useUserContext() as UserContextType
  const { reCaptchaLoaded, generateReCaptchaToken } = useRecaptchaContext() as RecaptchaContextType

  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [recaptchaError, setRecaptchaError] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [showOtp, setShowOtp] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    setValue,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  })

  const onSubmit = async (data: FormFields) => {
    try {
      const emailStatus = await UserService.validateEmail({ email: data.email })
      if (emailStatus !== 200) {
        setError('email', { message: commonStrings.EMAIL_ALREADY_REGISTERED })
        return
      }

      let recaptchaToken = ''
      if (reCaptchaLoaded) {
        recaptchaToken = await generateReCaptchaToken()
        if (!(await helper.verifyReCaptcha(recaptchaToken))) {
          recaptchaToken = ''
        }
      }

      if (env.RECAPTCHA_ENABLED && !recaptchaToken) {
        setRecaptchaError(true)
        return
      }

      const payload: bookcarsTypes.SignUpPayload = {
        email: data.email,
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        birthDate: data.birthDate,
        language: UserService.getLanguage()
      }

      const status = await UserService.signup(payload)

      if (status === 200) {
        setSignupEmail(data.email)
        setSignupPassword(data.password)
        setShowOtp(true)
      }
    } catch (err) {
      console.error(err)
      setError('root', { message: strings.SIGN_UP_ERROR })
    }
  }

  const onOtpVerified = async () => {
    try {
      const signInResult = await UserService.signin({
        email: signupEmail,
        password: signupPassword,
      })

      if (signInResult.status === 200) {
        const user = await UserService.getUser(signInResult.data._id)
        setUser(user)
        setUserLoaded(true)
        onSuccess?.()
      }
    } catch {
      setError('root', { message: strings.SIGN_UP_ERROR })
    }
  }

  if (showOtp) {
    return (
      <OtpVerification
        email={signupEmail}
        onVerified={onOtpVerified}
        onBack={() => setShowOtp(false)}
      />
    )
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" gutterBottom>
        {strings.SIGN_UP_HEADING}
      </Typography>

      <FormControl fullWidth margin="dense" error={!!errors.fullName}>
        <InputLabel className="required">{commonStrings.FULL_NAME}</InputLabel>
        <OutlinedInput
          type="text"
          {...register('fullName')}
          label={commonStrings.FULL_NAME}
          autoComplete="off"
          required
        />
      </FormControl>

      <FormControl fullWidth margin="dense" error={!!errors.email}>
        <InputLabel className="required">{commonStrings.EMAIL}</InputLabel>
        <OutlinedInput
          type="text"
          {...register('email')}
          label={commonStrings.EMAIL}
          autoComplete="off"
          onChange={() => {
            if (errors.email) {
              clearErrors('email')
            }
          }}
          required
        />
        <FormHelperText error={!!errors.email}>{errors.email?.message || ''}</FormHelperText>
      </FormControl>

      <FormControl fullWidth margin="dense" error={!!errors.phone}>
        <InputLabel className="required">{commonStrings.PHONE}</InputLabel>
        <OutlinedInput
          type="text"
          {...register('phone')}
          label={commonStrings.PHONE}
          autoComplete="off"
          onChange={() => {
            if (errors.phone) {
              clearErrors('phone')
            }
          }}
          required
        />
        <FormHelperText error={!!errors.phone}>{errors.phone?.message || ''}</FormHelperText>
      </FormControl>

      <FormControl fullWidth margin="dense" error={!!errors.birthDate}>
        <DatePicker
          label={commonStrings.BIRTH_DATE}
          variant="outlined"
          required
          onChange={(birthDate) => {
            if (birthDate) {
              if (errors.birthDate) {
                clearErrors('birthDate')
              }
              setValue('birthDate', birthDate, { shouldValidate: true })
            }
          }}
          language={language}
        />
        <FormHelperText error={!!errors.birthDate}>{errors.birthDate?.message || ''}</FormHelperText>
      </FormControl>

      <PasswordInput
        label={commonStrings.PASSWORD}
        variant="outlined"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        onChange={(e) => {
          if (errors.password) {
            clearErrors('password')
          }
          setValue('password', e.target.value)
        }}
        required
        inputProps={{
          autoComplete: 'new-password',
          form: {
            autoComplete: 'off',
          },
        }}
      />

      <PasswordInput
        label={commonStrings.CONFIRM_PASSWORD}
        variant="outlined"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        onChange={(e) => {
          if (errors.confirmPassword) {
            clearErrors('confirmPassword')
          }
          setValue('confirmPassword', e.target.value)
        }}
        required
        inputProps={{
          autoComplete: 'new-password',
          form: {
            autoComplete: 'off',
          },
        }}
      />

      <Box className="signup-tos">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell aria-label="tos">
                <Checkbox
                  {...register('tos')}
                  color="primary"
                  onChange={() => {
                    if (errors.tos) {
                      clearErrors('tos')
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <Link href="/tos" target="_blank" rel="noreferrer">
                  {commonStrings.TOS}
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>
                <FormHelperText error={!!errors.tos}>{errors.tos?.message || ''}</FormHelperText>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <SocialLogin redirectToHomepage />

      <Box display="flex" gap={2} mt={2}>
        {onSwitchToSignIn && (
          <Button variant="outlined" color="primary" onClick={onSwitchToSignIn}>
            {strings.SIGN_IN_INSTEAD}
          </Button>
        )}
        <Button type="submit" variant="contained" className="btn-primary" disabled={isSubmitting}>
          {strings.SIGN_UP}
        </Button>
      </Box>

      {errors.root && <Error message={errors.root.message!} />}
      {recaptchaError && <Error message={commonStrings.RECAPTCHA_ERROR} />}
    </Box>
  )
}

export default SignUpForm
