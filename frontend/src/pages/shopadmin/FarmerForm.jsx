import React, { useState } from 'react'
import api from '../../lib/apiClient'
import { useNavigate } from 'react-router-dom'

export default function FarmerForm() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [village, setVillage] = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/farmers', { name, phone, village })
      navigate('/shop/farmers')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Add Farmer</h2>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Village</label>
          <input value={village} onChange={e=>setVillage(e.target.value)} />
        </div>
        <div>
          <button className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  )
}
