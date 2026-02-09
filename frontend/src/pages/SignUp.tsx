import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import env from '@/config/env.config'
import * as UserService from '@/services/UserService'
import { useUserContext, UserContextType } from '@/context/UserContext'
import Layout from '@/components/Layout'
import SignUpForm from '@/components/SignUpForm'
import Footer from '@/components/Footer'

import '@/assets/css/signup.css'

const SignUp = () => {
  const navigate = useNavigate()
  const { setUser, setUserLoaded } = useUserContext() as UserContextType
  const [language, setLanguage] = useState(env.DEFAULT_LANGUAGE)
  const [visible, setVisible] = useState(false)

  const onLoad = (user?: bookcarsTypes.User) => {
    if (user) {
      navigate('/')
    } else {
      setLanguage(UserService.getLanguage())
      setVisible(true)
    }
  }

  const handleSuccess = () => {
    navigate('/')
  }

  const handleSwitchToSignIn = () => {
    navigate('/sign-in')
  }

  return (
    <Layout strict={false} onLoad={onLoad}>
      <div className="signup">
        <Paper className={`signup-form ${visible ? '' : 'hidden'}`} elevation={10}>
          <SignUpForm
            onSuccess={handleSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        </Paper>
      </div>

      <Footer />
    </Layout>
  )
}

export default SignUp
