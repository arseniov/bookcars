import React, { useState } from 'react'
import { OTPInput } from 'input-otp'
import {
  Box,
  Typography,
  Button,
  InputBaseComponentProps,
} from '@mui/material'
import * as UserService from '@/services/UserService'
import { strings } from '@/lang/sign-up'
import Error from '@/components/Error'

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
  const [otp, setOtp] = useState('')

  const onSubmit = async () => {
    if (otp.length !== 6) {
      setError(strings.OTP_INVALID)
      return
    }

    setLoading(true)
    setError(undefined)

    try {
      const status = await UserService.verifyOtp(email, otp)
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
    setOtp('')

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

  const inputBaseProps: InputBaseComponentProps = {
    maxLength: 6,
    autoComplete: 'one-time-code',
  }

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

      <Box display="flex" justifyContent="center" mb={3}>
        <OTPInput
          maxLength={6}
          value={otp}
          onChange={setOtp}
          containerClassName="otp-container"
          render={({ slots }) => (
            <Box display="flex" gap={1}>
              {slots.map((slot, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 48,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid',
                    borderColor: slot.isActive ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    backgroundColor: slot.isActive ? 'action.hover' : 'background.paper',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {slot.char !== null && (
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {slot.char}
                    </Typography>
                  )}
                  {slot.isActive && (
                    <Box
                      sx={{
                      width: 2,
                      height: 24,
                      backgroundColor: 'primary.main',
                      animation: 'caret-blink 1s ease-in-out infinite',
                      '@keyframes caret-blink': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0 },
                      },
                    }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        />
      </Box>

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
          variant="contained"
          onClick={onSubmit}
          disabled={loading || otp.length !== 6}
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
  )
}

export default OtpVerification
