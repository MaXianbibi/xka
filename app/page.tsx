
import React from 'react'
import { DashboardHeader } from './components/MainView/DashboardHeader'
import { DashboardClient } from './components/client/DatabaseStatusProvider'
import { getDashboardData } from './lib/actions/dashboard'

export default async function Home() {
  // Charger toutes les données initiales côté serveur
  const initialData = await getDashboardData()

  return (
    <div className="flex-1 bg-zinc-950 overflow-auto custom-scrollbar">
      <DashboardHeader />
      <DashboardClient initialData={initialData} />
    </div>
  )
}
