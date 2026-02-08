import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import { strings } from '@/lang/category'
import * as helper from '@/utils/helper'
import env from '@/config/env.config'
import * as LocationService from '@/services/LocationService'
import Layout from '@/components/Layout'
import NoMatch from './NoMatch'
import SearchForm from '@/components/SearchForm'
import CarList from '@/components/CarList'

import '@/assets/css/category.css'

const Category = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [visible, setVisible] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const [category, setCategory] = useState<bookcarsTypes.Category>()
  const [pickupLocation, setPickupLocation] = useState<bookcarsTypes.Location>()
  const [dropOffLocation, setDropOffLocation] = useState<bookcarsTypes.Location>()
  const [from, setFrom] = useState<Date>()
  const [to, setTo] = useState<Date>()
  const [ranges, setRanges] = useState<bookcarsTypes.CarRange[]>([])

  useEffect(() => {
    if (id) {
      const _category = bookcarsHelper.getCategory(id)
      if (_category) {
        setCategory(_category)
        setRanges([_category.carRange])
        setVisible(env.DUAL_BOOKING_FLOW_ENABLED)
      } else {
        setNoMatch(true)
      }
    } else {
      setNoMatch(true)
    }
  }, [id])

  const handleSearchSubmit = (data: any) => {
    if (data.pickupLocation && data.from && data.to) {
      const pickupLocationId = data.pickupLocation._id
      const dropOffLocationId = data.dropOffLocation?._id || pickupLocationId
      const _from = data.from
      const _to = data.to

      setPickupLocation(data.pickupLocation)
      setDropOffLocation(data.dropOffLocation || data.pickupLocation)
      setFrom(_from)
      setTo(_to)
    }
  }

  const onLoad = async (user?: bookcarsTypes.User) => {
    if (!env.DUAL_BOOKING_FLOW_ENABLED) {
      setNoMatch(true)
      return
    }

    if (!category) {
      setNoMatch(true)
      return
    }

    setVisible(true)
  }

  return (
    <>
      <Layout onLoad={onLoad} strict={false}>
        {visible && category && (
          <div className="category">
            <Box className="category-header">
              <Typography variant="h4" className="category-title">
                {category.name}
              </Typography>
              {category.description && (
                <Typography variant="body1" className="category-description">
                  {category.description}
                </Typography>
              )}
            </Box>

            <Box className="category-search">
              <SearchForm
                onSubmit={handleSearchSubmit}
              />
            </Box>

            {pickupLocation && from && to && (
              <CarList
                carSpecs={{}}
                suppliers={undefined}
                carType={[]}
                gearbox={[bookcarsTypes.GearboxType.Automatic, bookcarsTypes.GearboxType.Manual]}
                mileage={[bookcarsTypes.Mileage.Limited, bookcarsTypes.Mileage.Unlimited]}
                fuelPolicy={bookcarsHelper.getAllFuelPolicies()}
                deposit={-1}
                pickupLocation={pickupLocation._id}
                dropOffLocation={dropOffLocation?._id || pickupLocation._id}
                loading={false}
                from={from}
                to={to}
                ranges={ranges}
                multimedia={[]}
                rating={-1}
                seats={-1}
                hideSupplier={env.HIDE_SUPPLIERS}
                includeComingSoonCars
              />
            )}
          </div>
        )}

        {noMatch && <NoMatch hideHeader />}
      </Layout>
    </>
  )
}

export default Category
