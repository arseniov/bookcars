import React from 'react'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Box,
  Typography,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as bookcarsTypes from ':bookcars-types'
import { strings as commonStrings } from '@/lang/common'
import { strings } from '@/lang/sign-in'
import * as UserService from '@/services/UserService'
import { useUserContext, UserContextType } from '@/context/UserContext'
import PasswordInput from '@/components/PasswordInput'
import SocialLogin from '@/components/SocialLogin'
import Error from '@/components/Error'
import { schema, FormFields } from '@/models/SignInForm'

interface SignInFormProps {
  onSuccess?: () => void
  onSwitchToSignUp?: () => void
}

const SignInForm = ({ onSuccess, onSwitchToSignUp }: SignInFormProps) => {
  const { setUser, setUserLoaded } = useUserContext() as UserContextType

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
  })

  const onSubmit = async ({ email, password }: FormFields) => {
    try {
      const data: bookcarsTypes.SignInPayload = {
        email,
        password,
        stayConnected: UserService.getStayConnected()
      }

      const res = await UserService.signin(data)

      if (res.status === 200) {
        if (res.data.blacklisted) {
          await UserService.signout(false)
          setError('root', { message: strings.IS_BLACKLISTED })
        } else {
          const user = await UserService.getUser(res.data._id)
          setUser(user)
          setUserLoaded(true)
          onSuccess?.()
        }
      } else {
        setError('root', { message: strings.ERROR_IN_SIGN_IN })
      }
    } catch {
      setError('root', { message: strings.ERROR_IN_SIGN_IN })
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h5" gutterBottom>
        {strings.SIGN_IN_HEADING}
      </Typography>

      <FormControl fullWidth margin="dense" error={!!errors.email}>
        <InputLabel>{commonStrings.EMAIL}</InputLabel>
        <OutlinedInput
          {...register('email')}
          autoComplete="email"
          required
        />
        <FormHelperText error={!!errors.email}>{errors.email?.message || ''}</FormHelperText>
      </FormControl>

      <PasswordInput
        label={commonStrings.PASSWORD}
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        required
        autoComplete="password"
      />

      <Box width="100%" mt={2}>
        <SocialLogin reloadPage />
      </Box>

      <Box display="flex" gap={2} mt={2}>
        {onSwitchToSignUp && (
          <Button variant="outlined" color="primary" onClick={onSwitchToSignUp}>
            {strings.SIGN_UP}
          </Button>
        )}
        <Button type="submit" variant="contained" className="btn-primary" disabled={isSubmitting}>
          {strings.SIGN_IN}
        </Button>
      </Box>

      {errors.root && <Error message={errors.root.message!} />}
    </Box>
  )
}

export default SignInForm
