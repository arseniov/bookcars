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
import * as SupplierService from '@/services/SupplierService'

interface RentalAgreementDialogProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
  carId: string
  supplierId: string
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
  supplierId,
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
        const supplier = await SupplierService.getSupplier(supplierId)
        if (supplier && supplier.rentalAgreementContent) {
          setContent(supplier.rentalAgreementContent)
        } else {
          setContent('')
        }
        setLoading(false)
      } catch (err) {
        setError(strings.LOAD_ERROR)
        setLoading(false)
      }
    }

    if (open && supplierId) {
      fetchContent()
      setAccepted(false)
    }
  }, [open, supplierId])

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
        ) : !content ? (
          <Typography variant="body1" className="agreement-text">
            {strings.NO_CONTENT}
          </Typography>
        ) : (
          <Box className="rental-agreement-content">
            <Typography
              variant="body1"
              className="agreement-text"
              dangerouslySetInnerHTML={{ __html: content }}
            />
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
