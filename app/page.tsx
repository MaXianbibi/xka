
'use client'

import React, { useState } from 'react'
import { DashboardHeader } from './components/dashboard/DashboardHeader'
import { StatsOverview } from './components/dashboard/StatsOverview'
import { TabNavigation } from './components/dashboard/TabNavigation'
import { WorkflowsOverview } from './components/dashboard/WorkflowsOverview'
import { ExecutionHistory } from './components/dashboard/ExecutionHistory'

// Mock data - à remplacer par de vraies données plus tard
const MOCK_STATS = {
  totalExecutions: 1247,
  successfulExecutions: 1089,
  failedExecutions: 158,
  failureRate: 12.7,
  avgRuntime: 2.4
}

const MOCK_WORKFLOWS = [
  {
    id: '1',
    name: 'User Registration Flow',
    tag: 'Authentication',
    isActive: true,
    lastExecuted: '2025-01-28T10:30:00Z',
    lastUpdated: '2025-01-27T14:20:00Z',
    createdAt: '2025-01-15T09:00:00Z',
    status: 'success',
    executions: 45,
    avgRuntime: 1.2
  },
  {
    id: '2',
    name: 'Payment Processing',
    tag: 'Finance',
    isActive: false,
    lastExecuted: '2025-01-28T09:15:00Z',
    lastUpdated: '2025-01-28T08:30:00Z',
    createdAt: '2025-01-10T11:30:00Z',
    status: 'failed',
    executions: 23,
    avgRuntime: 3.8
  },
  {
    id: '3',
    name: 'Email Campaign Trigger',
    tag: 'Marketing',
    isActive: true,
    lastExecuted: '2025-01-28T08:45:00Z',
    lastUpdated: '2025-01-26T16:10:00Z',
    createdAt: '2025-01-12T13:45:00Z',
    status: 'success',
    executions: 67,
    avgRuntime: 0.9
  },
  {
    id: '4',
    name: 'Data Sync Process',
    tag: 'Integration',
    isActive: true,
    lastExecuted: '2025-01-27T16:20:00Z',
    lastUpdated: '2025-01-25T10:15:00Z',
    createdAt: '2025-01-08T15:20:00Z',
    status: 'success',
    executions: 12,
    avgRuntime: 5.2
  },
  {
    id: '5',
    name: 'Inventory Update',
    tag: 'Operations',
    isActive: true,
    lastExecuted: '2025-01-28T07:30:00Z',
    lastUpdated: '2025-01-27T12:45:00Z',
    createdAt: '2025-01-20T08:15:00Z',
    status: 'success',
    executions: 89,
    avgRuntime: 2.1
  }
]

const MOCK_RECENT_EXECUTIONS = [
  {
    id: 'exec-1',
    workflowName: 'User Registration Flow',
    status: 'success',
    startTime: '2025-01-28T10:30:00Z',
    duration: 1.2,
    nodeCount: 5
  },
  {
    id: 'exec-2',
    workflowName: 'Payment Processing',
    status: 'failed',
    startTime: '2025-01-28T09:15:00Z',
    duration: 2.1,
    nodeCount: 8
  },
  {
    id: 'exec-3',
    workflowName: 'Email Campaign Trigger',
    status: 'success',
    startTime: '2025-01-28T08:45:00Z',
    duration: 0.9,
    nodeCount: 3
  }
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview')

  return (
    <div className="flex-1 bg-zinc-950 overflow-auto">
      <DashboardHeader />

      <div className="p-6 space-y-8">
        <StatsOverview stats={MOCK_STATS} />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === 'overview' && (
          <WorkflowsOverview workflows={MOCK_WORKFLOWS} />
        )}

        {activeTab === 'history' && (
          <ExecutionHistory executions={MOCK_RECENT_EXECUTIONS} />
        )}
      </div>
    </div>
  )
}
