'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Train } from 'lucide-react'
import { motion } from 'framer-motion'

// Dynamically import the form component with no SSR
const TicketScanForm = dynamic(() => import('@/components/TicketScanForm'), {
  ssr: false,
  loading: () => <FormSkeleton />
})

// Skeleton loader for the form that maintains the layout structure
function FormSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Scanner section skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-1 h-6 bg-tr-blue rounded-full"></span>
          條碼掃描
        </h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="w-full py-16 rounded-xl border-2 border-dashed border-gray-300"></div>
        </div>
      </div>

      {/* Basic info skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-1 h-6 bg-tr-orange rounded-full"></span>
          基本資訊
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Trip info skeleton */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <span className="w-1 h-6 bg-tr-yellow rounded-full"></span>
          行程資訊
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Button skeleton */}
      <div className="flex gap-4 pt-4">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-1/4 h-12 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  )
}

export default function TicketPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-6"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <motion.h1
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"
        >
          <motion.div
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Train className="w-6 h-6 text-tr-blue" />
          </motion.div>
          車票資訊
        </motion.h1>

        <Suspense fallback={<FormSkeleton />}>
          <TicketScanForm />
        </Suspense>
      </motion.div>
    </motion.div>
  )
}