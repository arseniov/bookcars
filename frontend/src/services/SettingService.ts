import * as bookcarsTypes from ':bookcars-types'
import axiosInstance from './axiosInstance'

/**
 * Get Settings.
 *
 * @param {bookcarsTypes.CountryName[]} data
 * @returns {Promise<number>}
 */
export const getSettings = (): Promise<bookcarsTypes.Setting | null> =>
  axiosInstance
    .get(
      '/api/settings',
    )
    .then((res) => res.data)

/**
 * Update Settings.
 *
 * @param {bookcarsTypes.Setting} data
 * @returns {Promise<number>}
 */
export const updateSettings = (data: bookcarsTypes.Setting): Promise<number> =>
  axiosInstance
    .post(
      '/api/settings',
      data,
    )
    .then((res) => res.status)
