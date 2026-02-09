import React from 'react'
import { Box, Step, Stepper, StepLabel, Typography } from '@mui/material'
import { strings } from '@/lang/checkout'

interface CheckoutStepperProps {
  activeStep: number
}

const steps = [
  strings.STEP_AUTH,
  strings.STEP_BOOKING,
  strings.STEP_REVIEW,
]

const CheckoutStepper = ({ activeStep }: CheckoutStepperProps) => {
  return (
    <Box className="checkout-stepper">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>
              <Typography variant="body2" className="step-label">
                {label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}

export default CheckoutStepper
