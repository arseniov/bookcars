import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import { strings } from '@/lang/rental-agreement'
import * as SettingService from '@/services/SettingService'

interface RentalAgreementDialogProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
  carId: string
  pickupLocationId: string
  dropOffLocationId: string
  from: Date
  to: Date
}

const RentalAgreementDialog = ({
  open,
  onClose,
  onAccept,
  carId,
  pickupLocationId,
  dropOffLocationId,
  from,
  to,
}: RentalAgreementDialogProps) => {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const settings = await SettingService.getSettings()
        if (settings && settings.rentalAgreementContent) {
          setContent(settings.rentalAgreementContent)
        } else {
          setContent(strings.DEFAULT_CONTENT)
        }
        setLoading(false)
      } catch (err) {
        setError(strings.LOAD_ERROR)
        setLoading(false)
      }
    }

    if (open) {
      fetchContent()
      setAccepted(false)
    }
  }, [open])

  const handleAccept = () => {
    if (accepted) {
      onAccept()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{strings.TITLE}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <Box className="rental-agreement-content">
            <Typography variant="body1" className="agreement-text">
              {content || strings.DEFAULT_CONTENT}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box width="100%" display="flex" flexDirection="column" gap={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                color="primary"
              />
            }
            label={strings.ACCEPT_LABEL}
          />
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose} color="inherit">
              {strings.CANCEL}
            </Button>
            <Button
              onClick={handleAccept}
              variant="contained"
              color="primary"
              disabled={!accepted}
            >
              {strings.ACCEPT}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default RentalAgreementDialog
