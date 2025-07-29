'use client'

import React from 'react'
import Link from 'next/link'

export default function Dashboard() {
  return (
    <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 h-svh w-[12vw] min-w-[180px] max-w-[240px] border-r border-zinc-800 shadow-lg flex flex-col">
      {/* Header with App Name */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          XKA
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Execution Kit
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white transition-all duration-200 group"
          >
            <svg
              className="w-5 h-5 mr-3 text-zinc-400 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
              />
            </svg>
            Overview
          </Link>
        </nav>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-all duration-200 cursor-pointer group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white group-hover:text-zinc-100">
              Admin
            </p>
            <p className="text-xs text-zinc-400 truncate">
              Administrator
            </p>
          </div>
          <svg
            className="w-4 h-4 text-zinc-400 group-hover:text-zinc-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
