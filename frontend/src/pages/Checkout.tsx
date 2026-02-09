import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  OutlinedInput,
  InputLabel,
  FormControl,
  FormHelperText,
  Button,
  Paper,
  Checkbox,
  Link,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from '@mui/material'
import {
  DirectionsCar as CarIcon,
  Person as DriverIcon,
  Settings as PaymentOptionsIcon,
  Payment as LicenseIcon,
  AssignmentTurnedIn as ChecklistIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { fr, enUS, es } from 'date-fns/locale'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSchema, FormFields } from '@/models/CheckoutForm'
import CarList from '@/components/CarList'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import env from '@/config/env.config'
import * as BookingService from '@/services/BookingService'
import { strings as commonStrings } from '@/lang/common'
import { strings as csStrings } from '@/lang/cars'
import { strings } from '@/lang/checkout'
import * as helper from '@/utils/helper'
import * as UserService from '@/services/UserService'
import * as CarService from '@/services/CarService'
import * as LocationService from '@/services/LocationService'
import * as PaymentService from '@/services/PaymentService'
import * as StripeService from '@/services/StripeService'
import * as PayPalService from '@/services/PayPalService'
import * as SettingService from '@/services/SettingService'
import Layout from '@/components/Layout'
import Error from '@/components/Error'
import DatePicker from '@/components/DatePicker'
import SocialLogin from '@/components/SocialLogin'
import PasswordInput from '@/components/PasswordInput'
import { useUserContext, UserContextType } from '@/context/UserContext'
import Map from '@/components/Map'
import DriverLicense from '@/components/DriverLicense'
import Progress from '@/components/Progress'
import CheckoutStatus from '@/components/CheckoutStatus'
import NoMatch from './NoMatch'
import CheckoutOptions from '@/components/CheckoutOptions'
import Footer from '@/components/Footer'
import ViewOnMapButton from '@/components/ViewOnMapButton'
import MapDialog from '@/components/MapDialog'
import Backdrop from '@/components/SimpleBackdrop'
import Unauthorized from '@/components/Unauthorized'
import RentalAgreementDialog from '@/components/RentalAgreementDialog'
import DeliveryOption from '@/components/DeliveryOption'
import CheckoutStepper from '@/components/CheckoutStepper'
import OtpVerification from '@/components/OtpVerification'
import SignInForm from '@/components/SignInForm'
import SignUpForm from '@/components/SignUpForm'

import '@/assets/css/checkout.css'
import '@/assets/css/checkout-stepper.css'

const stripePromise = env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.Stripe ? loadStripe(env.STRIPE_PUBLISHABLE_KEY) : null

type CheckoutStep = 0 | 1 | 2
type AuthMode = 'signin' | 'signup' | 'otp'

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState<bookcarsTypes.User>()
  const [car, setCar] = useState<bookcarsTypes.Car>()
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location>()
  const [dropOffLocation, setDropOffLocation] = useState<bookcarsTypes.Location>()
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [visible, setVisible] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [noMatch, setNoMatch] = useState(false)
  const [emailRegistered, setEmailRegistered] = useState(false)
  const [emailInfo, setEmailInfo] = useState(true)
  const [phoneInfo, setPhoneInfo] = useState(true)
  const [price, setPrice] = useState(0)
  const [depositPrice, setDepositPrice] = useState(0)
  const [success, setSuccess] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [recaptchaError, setRecaptchaError] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string>()
  const [sessionId, setSessionId] = useState<string>()
  const [licenseRequired, setLicenseRequired] = useState(false)
  const [license, setLicense] = useState<string | null>(null)
  const [openMapDialog, setOpenMapDialog] = useState(false)
  const [payPalLoaded, setPayPalLoaded] = useState(false)
  const [payPalInit, setPayPalInit] = useState(false)
  const [payPalProcessing, setPayPalProcessing] = useState(false)
  const [rentalAgreementOpen, setRentalAgreementOpen] = useState(false)
  const [rentalAgreementAccepted, setRentalAgreementAccepted] = useState(false)
  const [deliveryOption, setDeliveryOption] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState<bookcarsTypes.DeliveryAddress>()
  const [deliveryPrice, setDeliveryPrice] = useState(0)
  const [deliveryError, setDeliveryError] = useState<string>()
  const [rentalAgreementEnabled, setRentalAgreementEnabled] = useState(false)
  const [deliveryOptionEnabled, setDeliveryOptionEnabled] = useState(false)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(0)
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const { setUserLoaded } = useUserContext() as UserContextType

  const birthDateRef = useRef<HTMLInputElement | null>(null)
  const additionalDriverBirthDateRef = useRef<HTMLInputElement | null>(null)
  const additionalDriverEmailRef = useRef<HTMLInputElement | null>(null)
  const additionalDriverPhoneRef = useRef<HTMLInputElement | null>(null)

  const _fr = language === 'fr'
  const _es = language === 'es'
  const _locale = _fr ? fr : _es ? es : enUS
  const _format = _fr ? 'eee d LLL yyyy kk:mm' : _es ? 'eee, d LLLL yyyy HH:mm' : 'eee, d LLL yyyy, p'
  const bookingDetailHeight = env.SUPPLIER_IMAGE_HEIGHT + 10
  const days = bookcarsHelper.days(from, to)
  const daysLabel = from && to && `${helper.getDaysShort(days)} (${bookcarsHelper.capitalize(format(from, _format, { locale: _locale }))} - ${bookcarsHelper.capitalize(format(to, _format, { locale: _locale }))})`

  const schema = createSchema(car)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
    setFocus,
    trigger,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    shouldUnregister: false,
    defaultValues: {
      additionalDriverEmail: '',
      additionalDriverPhone: '',
    }
  })

  const additionalDriverEmail = useWatch({ control, name: 'additionalDriverEmail' })
  const additionalDriverPhone = useWatch({ control, name: 'additionalDriverPhone' })
  const additionalDriver = useWatch({ control, name: 'additionalDriver' })
  const payLater = useWatch({ control, name: 'payLater' })
  const payDeposit = useWatch({ control, name: 'payDeposit' })
  const payInFull = useWatch({ control, name: 'payInFull' })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await SettingService.getSettings()
        if (settings) {
          setRentalAgreementEnabled(settings.rentalAgreementEnabled || false)
          setDeliveryOptionEnabled(settings.deliveryOptionEnabled || false)
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleRentalAgreementAccept = () => {
    setRentalAgreementAccepted(true)
    setRentalAgreementOpen(false)
  }

  const handleDeliveryChange = (value: 'pickup' | 'delivery', address?: bookcarsTypes.DeliveryAddress, price?: number) => {
    setDeliveryOption(value)
    if (address) {
      setDeliveryAddress(address)
    }
    if (price !== undefined) {
      setDeliveryPrice(price)
    }
    setDeliveryError(undefined)
  }

  const handleAuthSuccess = () => {
    const checkAuth = async () => {
      try {
        const _user = await UserService.getUser()
        if (_user && _user.verified) {
          setUser(_user)
          setAuthenticated(true)
          setCurrentStep(1)
        }
      } catch (err) {
        console.error('Failed to check auth:', err)
      }
    }
    checkAuth()
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    setAuthenticated(!!_user && _user.verified === true)
    setLanguage(UserService.getLanguage())

    const { state } = location
    if (!state) {
      setNoMatch(true)
      return
    }

    const { carId } = state
    const { pickupLocationId } = state
    const { dropOffLocationId } = state
    const { from: _from } = state
    const { to: _to } = state

    if (!carId || !pickupLocationId || !dropOffLocationId || !_from || !_to) {
      setNoMatch(true)
      return
    }

    let _car
    let _pickupLocation
    let _dropOffLocation

    try {
      _car = await CarService.getCar(carId)
      if (!_car) {
        setNoMatch(true)
        return
      }

      _pickupLocation = await LocationService.getLocation(pickupLocationId)

      if (!_pickupLocation) {
        setNoMatch(true)
        return
      }

      if (dropOffLocationId !== pickupLocationId) {
        _dropOffLocation = await LocationService.getLocation(dropOffLocationId)
      } else {
        _dropOffLocation = _pickupLocation
      }

      if (!_dropOffLocation) {
        setNoMatch(true)
        return
      }

      const priceChangeRate = _car.supplier.priceChangeRate || 0
      const _price = await PaymentService.convertPrice(bookcarsHelper.calculateTotalPrice(_car, _from, _to, priceChangeRate))
      let _depositPrice = _car.deposit > 0 ? await PaymentService.convertPrice(_car.deposit) : 0
      _depositPrice += _depositPrice * (priceChangeRate / 100)

      const included = (val: number) => val === 0

      setCar(_car)
      setPrice(_price)
      setDepositPrice(_depositPrice)
      setPickupLocation(_pickupLocation)
      setDropOffLocation(_dropOffLocation)
      setFrom(_from)
      setTo(_to)
      setValue('cancellation', included(_car.cancellation))
      setValue('amendments', included(_car.amendments))
      setValue('theftProtection', included(_car.theftProtection))
      setValue('collisionDamageWaiver', included(_car.collisionDamageWaiver))
      setValue('fullInsurance', included(_car.fullInsurance))
      setLicense(_user?.license || null)

      if (_user && _user.verified) {
        setAuthenticated(true)
        setCurrentStep(1)
      } else {
        setCurrentStep(0)
      }

      setVisible(true)
    } catch (err) {
      helper.error(err)
    }
  }

  const validateStep1 = async (): Promise<boolean> => {
    if (car?.supplier.licenseRequired && !license) {
      setLicenseRequired(true)
      return false
    }

    if (deliveryOptionEnabled && deliveryOption === 'delivery' && (!deliveryAddress?.street || !deliveryAddress?.city)) {
      setDeliveryError(strings.DELIVERY_ADDRESS_REQUIRED)
      return false
    }

    return true
  }

  const goToStep2 = async () => {
    const valid = await validateStep1()
    if (valid) {
      setCurrentStep(2)
    }
  }

  const goBackToStep1 = () => {
    setCurrentStep(1)
  }

  const onSubmit = async (data: FormFields) => {
    try {
      if (!car || !pickupLocation || !dropOffLocation || !from || !to) {
        helper.error()
        return
      }

      if (rentalAgreementEnabled && !rentalAgreementAccepted) {
        setRentalAgreementOpen(true)
        return
      }

      setPaymentFailed(false)

      let amount = price
      if (payDeposit) {
        amount = depositPrice
      } else if (payInFull) {
        amount = price + depositPrice
      }

      if (deliveryOption === 'delivery') {
        amount += deliveryPrice
      }

      const basePrice = await bookcarsHelper.convertPrice(amount, PaymentService.getCurrency(), env.BASE_CURRENCY)

      const booking: bookcarsTypes.Booking = {
        supplier: car.supplier._id as string,
        car: car._id,
        driver: user?._id,
        pickupLocation: pickupLocation._id,
        dropOffLocation: dropOffLocation._id,
        from,
        to,
        status: bookcarsTypes.BookingStatus.Pending,
        cancellation: data.cancellation,
        amendments: data.amendments,
        theftProtection: data.theftProtection,
        collisionDamageWaiver: data.collisionDamageWaiver,
        fullInsurance: data.fullInsurance,
        additionalDriver,
        price: basePrice,
        rentalAgreementAccepted: rentalAgreementEnabled ? rentalAgreementAccepted : undefined,
        rentalAgreementAcceptedAt: rentalAgreementEnabled && rentalAgreementAccepted ? new Date() : undefined,
        deliveryOption: deliveryOptionEnabled ? deliveryOption : undefined,
        deliveryAddress: deliveryOption === 'delivery' ? deliveryAddress : undefined,
        deliveryPrice: deliveryOption === 'delivery' ? deliveryPrice : 0,
      }

      let _customerId: string | undefined
      let _sessionId: string | undefined
      if (!data.payLater) {
        if (env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.Stripe) {
          const name = bookcarsHelper.truncateString(`${env.WEBSITE_NAME} - ${car.name}`, StripeService.ORDER_NAME_MAX_LENGTH)
          const _description = `${env.WEBSITE_NAME} - ${car.name} - ${daysLabel} - ${pickupLocation._id === dropOffLocation._id ? pickupLocation.name : `${pickupLocation.name} - ${dropOffLocation.name}`}`
          const description = bookcarsHelper.truncateString(_description, StripeService.ORDER_DESCRIPTION_MAX_LENGTH)

          let finalPrice = price
          if (payDeposit) {
            finalPrice = depositPrice
          } else if (payInFull) {
            finalPrice = price + depositPrice
          }

          if (deliveryOption === 'delivery') {
            finalPrice += deliveryPrice
          }

          const payload: bookcarsTypes.CreatePaymentPayload = {
            amount: finalPrice,
            currency: PaymentService.getCurrency(),
            locale: language,
            receiptEmail: user?.email as string,
            name,
            description,
            customerName: user?.fullName as string,
          }
          const res = await StripeService.createCheckoutSession(payload)
          setClientSecret(res.clientSecret)
          _sessionId = res.sessionId
          _customerId = res.customerId
        } else {
          setPayPalLoaded(true)
        }
      }

      booking.isDeposit = payDeposit
      booking.isPayedInFull = payInFull

      const payload: bookcarsTypes.CheckoutPayload = {
        driver: undefined,
        booking,
        additionalDriver: undefined,
        payLater: !!data.payLater,
        sessionId: _sessionId,
        customerId: _customerId,
        payPal: env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.PayPal,
      }

      const { status, bookingId: _bookingId } = await BookingService.checkout(payload)

      if (status === 200) {
        if (data.payLater) {
          setVisible(false)
          setSuccess(true)
        }
        setBookingId(_bookingId)
        setSessionId(_sessionId)
      } else {
        helper.error()
      }
    } catch (err) {
      helper.error(err)
    }
  }

  const onError = () => {
    const firstErrorField = Object.keys(errors)[0] as keyof FormFields
    if (firstErrorField) {
      if (firstErrorField === 'birthDate' && birthDateRef.current) {
        birthDateRef.current.focus()
      }
      if (firstErrorField === 'additionalDriverBirthDate' && additionalDriverBirthDateRef.current) {
        additionalDriverBirthDateRef.current.focus()
      } else if (firstErrorField === 'additionalDriverEmail' && additionalDriverEmailRef.current) {
        additionalDriverEmailRef.current.focus()
      } else if (firstErrorField === 'additionalDriverPhone' && additionalDriverPhoneRef.current) {
        additionalDriverPhoneRef.current.focus()
      } else {
        setFocus(firstErrorField)
      }
    }
  }

  const onSignInSuccess = () => {
    setAuthenticated(true)
    setCurrentStep(1)
  }

  const onSignUpSuccess = () => {
    setAuthenticated(true)
    setCurrentStep(1)
  }

  const onAuthSwitch = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
  }

  const renderStep0Auth = () => (
    <div className="checkout-auth-step">
      {authMode === 'signin' && (
        <SignInForm
          onSuccess={onSignInSuccess}
          onSwitchToSignUp={onAuthSwitch}
        />
      )}
      {authMode === 'signup' && (
        <SignUpForm
          onSuccess={onSignUpSuccess}
          onSwitchToSignIn={onAuthSwitch}
        />
      )}
      {authMode === 'otp' && (
        <OtpVerification
          email={signupEmail}
          onVerified={onSignUpSuccess}
          onBack={() => setAuthMode('signup')}
        />
      )}
    </div>
  )

  const renderStep1Details = () => (
    <form onSubmit={handleSubmit(() => { }, onError)}>
      <CheckoutOptions
        car={car!}
        from={from!}
        to={to!}
        language={language}
        clientSecret={clientSecret}
        payPalLoaded={payPalLoaded}
        onPriceChange={(value) => setPrice(value)}
        onAdManuallyCheckedChange={(value) => { }}
        onCancellationChange={(value) => setValue('cancellation', value)}
        onAmendmentsChange={(value) => setValue('amendments', value)}
        onTheftProtectionChange={(value) => setValue('theftProtection', value)}
        onCollisionDamageWaiverChange={(value) => setValue('collisionDamageWaiver', value)}
        onFullInsuranceChange={(value) => setValue('fullInsurance', value)}
        onAdditionalDriverChange={(value) => setValue('additionalDriver', value)}
      />

      {deliveryOptionEnabled && (
        <DeliveryOption
          value={deliveryOption}
          onChange={handleDeliveryChange}
          pickupLocationId={pickupLocation?._id || ''}
          error={deliveryError}
          car={car}
          rentalPrice={price}
        />
      )}

      <div className="checkout-step-actions">
        <div />
        <Button
          variant="contained"
          color="primary"
          onClick={goToStep2}
        >
          {strings.NEXT}
        </Button>
      </div>
    </form>
  )

  const renderStep2Review = () => (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="checkout-review-section">
        <h3>{strings.BOOKING_DETAILS}</h3>
        <div className="checkout-review-details">
          <div className="checkout-review-row">
            <span className="checkout-review-label">{strings.DAYS}</span>
            <span className="checkout-review-value">{daysLabel}</span>
          </div>
          <div className="checkout-review-row">
            <span className="checkout-review-label">{commonStrings.PICK_UP_LOCATION}</span>
            <span className="checkout-review-value">{pickupLocation?.name}</span>
          </div>
          <div className="checkout-review-row">
            <span className="checkout-review-label">{commonStrings.DROP_OFF_LOCATION}</span>
            <span className="checkout-review-value">{dropOffLocation?.name}</span>
          </div>
          {deliveryOption === 'delivery' && deliveryAddress && (
            <div className="checkout-review-row">
              <span className="checkout-review-label">{strings.DELIVERY_ADDRESS}</span>
              <span className="checkout-review-value">
                {deliveryAddress.street}, {deliveryAddress.city} {deliveryAddress.zipCode}
              </span>
            </div>
          )}
          <div className="checkout-review-row">
            <span className="checkout-review-label">{strings.CAR}</span>
            <span className="checkout-review-value">{`${car?.name} (${bookcarsHelper.formatPrice(price / days, commonStrings.CURRENCY, language)}${commonStrings.DAILY})`}</span>
          </div>
        </div>

        <div className="checkout-total-row">
          <span className="total-label">{strings.COST}</span>
          <span className="total-value">
            {bookcarsHelper.formatPrice(
              (payDeposit ? depositPrice : payInFull ? price + depositPrice : price) + (deliveryOption === 'delivery' ? deliveryPrice : 0),
              commonStrings.CURRENCY, language
            )}
          </span>
        </div>
      </div>

      {(!car?.supplier.payLater || !payLater) && (
        env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.Stripe
          ? (
            clientSecret && (
              <div className="payment-options-container">
                <EmbeddedCheckoutProvider
                  stripe={stripePromise}
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )
          )
          : payPalLoaded ? (
            <div className="payment-options-container">
              <PayPalButtons
                createOrder={async () => {
                  const name = bookcarsHelper.truncateString(car?.name || '', PayPalService.ORDER_NAME_MAX_LENGTH)
                  const _description = `${car?.name} - ${daysLabel}`
                  const description = bookcarsHelper.truncateString(_description, PayPalService.ORDER_DESCRIPTION_MAX_LENGTH)
                  let amount = price
                  if (payDeposit) {
                    amount = depositPrice
                  } else if (payInFull) {
                    amount = price + depositPrice
                  }
                  if (deliveryOption === 'delivery') {
                    amount += deliveryPrice
                  }
                  const orderId = await PayPalService.createOrder(bookingId!, amount, PaymentService.getCurrency(), name, description)
                  return orderId
                }}
                onApprove={async (data, actions) => {
                  try {
                    setPayPalProcessing(true)
                    await actions.order?.capture()
                    const { orderID } = data
                    const status = await PayPalService.checkOrder(bookingId!, orderID)

                    if (status === 200) {
                      setVisible(false)
                      setSuccess(true)
                    } else {
                      setPaymentFailed(true)
                    }
                  } catch (err) {
                    helper.error(err)
                  } finally {
                    setPayPalProcessing(false)
                  }
                }}
                onInit={() => {
                  setPayPalInit(true)
                }}
                onCancel={() => {
                  setPayPalProcessing(false)
                }}
                onError={() => {
                  setPayPalProcessing(false)
                }}
              />
            </div>
          ) : null
      )}

      <div className="checkout-step-actions">
        <Button
          variant="outlined"
          color="primary"
          onClick={goBackToStep1}
        >
          {strings.BACK}
        </Button>
        {(
          (env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.Stripe && !clientSecret)
          || (env.PAYMENT_GATEWAY === bookcarsTypes.PaymentGateway.PayPal && !payPalInit)
          || payLater) && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || (payPalLoaded && !payPalInit)}
            >
              {isSubmitting || (payPalLoaded && !payPalInit)
                ? <CircularProgress color="inherit" size={24} />
                : strings.BOOK}
            </Button>
          )}
      </div>

      <div className="form-error">
        {paymentFailed && <Error message={strings.PAYMENT_FAILED} />}
      </div>
    </form>
  )

  return (
    <>
      <Layout onLoad={onLoad} strict={false}>
      {!user?.blacklisted && visible && car && from && to && pickupLocation && dropOffLocation && (
        <div className="checkout">
          <Paper className="checkout-form" elevation={10}>
            <h1 className="checkout-form-title">{strings.BOOKING_HEADING}</h1>

            <CheckoutStepper activeStep={currentStep} />

            {currentStep === 0 && renderStep0Auth()}
            {currentStep === 1 && renderStep1Details()}
            {currentStep === 2 && renderStep2Review()}

          </Paper>
        </div>
      )}

      {user?.blacklisted && <Unauthorized />}

      {noMatch && <NoMatch hideHeader />}

      {success && bookingId && (
        <CheckoutStatus
          bookingId={bookingId}
          language={language}
          payLater={payLater}
          status="success"
          className="status"
        />
      )}

      {payPalProcessing && <Backdrop text={strings.CHECKING} />}

      <MapDialog
        pickupLocation={pickupLocation}
        openMapDialog={openMapDialog}
        onClose={() => setOpenMapDialog(false)}
      />

      <RentalAgreementDialog
        open={rentalAgreementOpen}
        onClose={() => setRentalAgreementOpen(false)}
        onAccept={handleRentalAgreementAccept}
        carId={car?._id || ''}
        supplierId={car?.supplier._id || ''}
        pickupLocationId={pickupLocation?._id || ''}
        dropOffLocationId={dropOffLocation?._id || ''}
        from={from || new Date()}
        to={to || new Date()}
      />
    </Layout>

    {loadingPage && !noMatch && <Progress />}
  </>
)
}

export default Checkout
