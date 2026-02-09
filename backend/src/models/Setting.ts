import { Schema, model } from 'mongoose'
import * as env from '../config/env.config'

const settingSchema = new Schema<env.Setting>({
  minPickupHours: {
    type: Number,
    default: 1,
    min: 1,
  },
  minRentalHours: {
    type: Number,
    default: 1,
    min: 1,
  },
  minPickupDropoffHour: {
    type: Number,
    default: 0,
    min: 0,
    max: 23,
  },
  maxPickupDropoffHour: {
    type: Number,
    default: 23,
    min: 0,
    max: 23,
  },
  dualBookingFlowEnabled: {
    type: Boolean,
    default: false,
  },
  rentalAgreementEnabled: {
    type: Boolean,
    default: false,
  },
  deliveryOptionEnabled: {
    type: Boolean,
    default: false,
  },
  deliveryBaseRate: {
    type: Number,
    default: 2,
    min: 0,
  },
  deliveryMinFee: {
    type: Number,
    default: 10,
    min: 0,
  },
}, {
  timestamps: true,
  strict: true,
  collection: 'Setting',
})

const Setting = model<env.Setting>('Setting', settingSchema)

export default Setting
