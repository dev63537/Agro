import { useQuery } from 'react-query'
import api from '../../lib/apiClient'

export const useMasterSales = () =>
  useQuery('master-sales', async () => {
    const res = await api.get('/master/reports/sales')
    return res.data
  })

export const useMasterTopFarmers = () =>
  useQuery('master-top-farmers', async () => {
    const res = await api.get('/master/reports/farmers')
    return res.data
  })

export const useMasterLowStock = (threshold = 10) =>
  useQuery(['master-low-stock', threshold], async () => {
    const res = await api.get(`/master/reports/low-stock?threshold=${threshold}`)
    return res.data
  })
