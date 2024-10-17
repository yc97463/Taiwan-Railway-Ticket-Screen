'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const TicketScanForm = dynamic(() => import('./TicketScanForm'), { 
    ssr: false,
    loading: () => <div>Loading form...</div>
})

export default function TicketScan() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TicketScanForm />
        </Suspense>
    )
}