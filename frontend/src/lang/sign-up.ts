import LocalizedStrings from 'localized-strings'
import * as langHelper from '@/utils/langHelper'

const strings = new LocalizedStrings({
  fr: {
    SIGN_UP_HEADING: 'Inscription',
    SIGN_UP: "S'inscrire",
    SIGN_UP_ERROR: "Une erreur s'est produite lors de l'inscription.",
    OTP_TITLE: 'Vérification de votre compte',
    OTP_MESSAGE: 'Veuillez saisir le code de vérification envoyé à votre adresse e-mail.',
    OTP_PLACEHOLDER: 'Code à 6 chiffres',
    OTP_VERIFY: 'Vérifier',
    OTP_RESEND: 'Renvoyer le code',
    OTP_RESEND_SUCCESS: 'Un nouveau code de vérification a été envoyé.',
    OTP_INVALID: 'Code invalide ou expiré.',
    OTP_EXPIRED: 'Le code a expiré. Veuillez demander un nouveau code.',
    SIGN_IN_INSTEAD: 'Déjà inscrit ?',
    BACK: 'Retour',
  },
  en: {
    SIGN_UP_HEADING: 'Register',
    SIGN_UP: 'Register',
    SIGN_UP_ERROR: 'An error occurred during sign up.',
    OTP_TITLE: 'Verify your account',
    OTP_MESSAGE: 'Please enter the verification code sent to your email address.',
    OTP_PLACEHOLDER: '6-digit code',
    OTP_VERIFY: 'Verify',
    OTP_RESEND: 'Resend code',
    OTP_RESEND_SUCCESS: 'A new verification code has been sent.',
    OTP_INVALID: 'Invalid or expired code.',
    OTP_EXPIRED: 'The code has expired. Please request a new code.',
    SIGN_IN_INSTEAD: 'Already registered?',
    BACK: 'Back',
  },
  es: {
    SIGN_UP_HEADING: 'Regístrate',
    SIGN_UP: 'Regístrate',
    SIGN_UP_ERROR: 'Se produjo un error durante el registro.',
    OTP_TITLE: 'Verifica tu cuenta',
    OTP_MESSAGE: 'Por favor, ingresa el código de verificación enviado a tu dirección de correo electrónico.',
    OTP_PLACEHOLDER: 'Código de 6 dígitos',
    OTP_VERIFY: 'Verificar',
    OTP_RESEND: 'Reenviar código',
    OTP_RESEND_SUCCESS: 'Se ha enviado un nuevo código de verificación.',
    OTP_INVALID: 'Código inválido o expirado.',
    OTP_EXPIRED: 'El código ha expirado. Por favor solicita un nuevo código.',
    SIGN_IN_INSTEAD: '¿Ya estás registrado?',
    BACK: 'Volver',
  },
})

langHelper.setLanguage(strings)
export { strings }
