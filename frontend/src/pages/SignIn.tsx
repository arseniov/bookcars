import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import * as UserService from '@/services/UserService'
import { useUserContext, UserContextType } from '@/context/UserContext'
import Layout from '@/components/Layout'
import SignInForm from '@/components/SignInForm'
import Footer from '@/components/Footer'

import '@/assets/css/signin.css'

const SignIn = () => {
  const navigate = useNavigate()
  const { setUser, setUserLoaded } = useUserContext() as UserContextType
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [visible, setVisible] = useState(false)

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      const params = new URLSearchParams(window.location.search)
      if (params.has('from')) {
        const from = params.get('from')
        if (from === 'checkout') {
          navigate('/checkout', {
            state: {
              carId: params.get('c'),
              pickupLocationId: params.get('p'),
              dropOffLocationId: params.get('d'),
              from: new Date(Number(params.get('f'))),
              to: new Date(Number(params.get('t'))),
            }
          })
        } else {
          navigate('/')
        }
      } else {
        navigate('/')
      }
    } else {
      setLanguage(UserService.getLanguage())
      setVisible(true)
    }
  }

  const handleSuccess = () => {
    navigate('/')
  }

  const handleSwitchToSignUp = () => {
    navigate('/sign-up')
  }

  return (
    <Layout strict={false} onLoad={onLoad}>
      <div className="signin">
        <Paper className={`signin-form ${visible ? '' : 'hidden'}`} elevation={10}>
          <SignInForm
            onSuccess={handleSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        </Paper>
      </div>

      <Footer />
    </Layout>
  )
}

export default SignIn
