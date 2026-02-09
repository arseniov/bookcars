import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  OutlinedInput,
  Button,
  FormHelperText,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as UserService from '@/services/UserService'
import { strings } from '@/lang/sign-up'
import Error from '@/components/Error'

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

type OtpFormFields = z.infer<typeof otpSchema>

interface OtpVerificationProps {
  email: string
  onVerified: () => void
  onResend?: () => void
  onBack?: () => void
}

const OtpVerification = ({ email, onVerified, onResend, onBack }: OtpVerificationProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const otpInputs = Array(6).fill(0)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OtpFormFields>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
  })

  const handleOtpChange = (index: number, value: string) => {
    const newValue = value.replace(/\D/g, '')
    setValue('otp', newValue)

    if (newValue.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length > 0) {
      const newOtp = pastedData.padEnd(6, '')
      setValue('otp', newOtp)
      newOtp.split('').forEach((char, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = char
          if (index < 5 && char) {
            inputRefs.current[index + 1]?.focus()
          }
        }
      })
    }
    e.preventDefault()
  }

  const onSubmit = async (data: OtpFormFields) => {
    setLoading(true)
    setError(undefined)

    try {
      const status = await UserService.verifyOtp(email, data.otp)
      if (status === 200) {
        onVerified()
      } else {
        setError(strings.OTP_INVALID)
      }
    } catch {
      setError(strings.OTP_INVALID)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError(undefined)
    setResendSuccess(false)

    try {
      const status = await UserService.resendOtp(email)
      if (status === 200) {
        setResendSuccess(true)
        onResend?.()
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch {
      setError(strings.OTP_INVALID)
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <Box className="otp-verification">
      <Typography variant="h5" gutterBottom>
        {strings.OTP_TITLE}
      </Typography>
      <Typography variant="body1" color="textSecondary" gutterBottom>
        {strings.OTP_MESSAGE}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {email}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" gap={1} justifyContent="center" mb={3} onPaste={handlePaste}>
          {otpInputs.map((_, index) => (
            <OutlinedInput
              key={index}
              inputRef={(el) => { inputRefs.current[index] = el }}
              inputProps={{
                maxLength: 1,
                style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }
              }}
              sx={{ width: 50, height: 60 }}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              error={!!errors.otp}
            />
          ))}
        </Box>
        <input type="hidden" {...register('otp')} />

        {errors.otp && (
          <FormHelperText error sx={{ textAlign: 'center', mb: 2 }}>
            {errors.otp.message}
          </FormHelperText>
        )}

        {error && <Error message={error} />}

        {resendSuccess && (
          <Typography color="success.main" sx={{ textAlign: 'center', mb: 2 }}>
            {strings.OTP_RESEND_SUCCESS}
          </Typography>
        )}

        <Box display="flex" gap={2} justifyContent="center" mt={2}>
          {onBack && (
            <Button variant="outlined" onClick={onBack}>
              {strings.BACK}
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? strings.CHECKING : strings.OTP_VERIFY}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Button
            variant="text"
            onClick={handleResend}
            disabled={resendLoading}
          >
            {strings.OTP_RESEND}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default OtpVerification
