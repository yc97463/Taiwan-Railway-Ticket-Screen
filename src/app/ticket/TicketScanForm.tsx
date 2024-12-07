// app/ticket/TicketScanForm.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useRouter, useSearchParams } from 'next/navigation'

interface TicketInfo {
    date: string;
    nbr: string;
    type: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    seat: string;
    token: string;
}

export default function TicketScanForm() {
    const [isScanning, setIsScanning] = useState(false)
    const [ticketInfo, setTicketInfo] = useState<TicketInfo>({
        date: '',
        nbr: '',
        type: '',
        from: '',
        to: '',
        departure: '',
        arrival: '',
        seat: '',
        token: ''
    })
    const scannerRef = useRef<Html5QrcodeScanner | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Populate form fields from URL parameters
        const date = searchParams.get('date') || ''
        const nbr = searchParams.get('nbr') || ''
        const type = searchParams.get('type') || ''
        const from = searchParams.get('from') || ''
        const to = searchParams.get('to') || ''
        const departure = searchParams.get('departure') || ''
        const arrival = searchParams.get('arrival') || ''
        const seat = searchParams.get('seat') || ''
        const token = searchParams.get('token') || ''

        const tokenFromUrl = searchParams.get('token') || '';
        setTicketInfo({
            date,
            nbr,
            type,
            from,
            to,
            departure,
            arrival,
            seat,
            token: tokenFromUrl,
        });
        setIsEditing(!!tokenFromUrl); // 有 token 時表示是編輯
    }, [searchParams])

    useEffect(() => {
        if (!isScanning) return

        const onScanSuccess = (decodedText: string) => {
            setTicketInfo(prev => ({ ...prev, token: decodedText }));
            setIsEditing(true); // 掃描新 token 時也進入編輯模式
            stopScanner();
        };

        const onScanFailure = (errorMessage: string) => {
            // Ignoring failures as they happen frequently
            return errorMessage;
        }

        const html5QrcodeScanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        )

        html5QrcodeScanner.render(onScanSuccess, onScanFailure)
        scannerRef.current = html5QrcodeScanner

        return () => {
            stopScanner()
        }
    }, [isScanning])

    const startScanner = () => {
        setIsScanning(true)
    }

    const stopScanner = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error)
            })
        }
        setIsScanning(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setTicketInfo(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Submitted ticket info:', ticketInfo)

        // Create search params without the token
        const { token, ...searchParams } = ticketInfo
        const queryString = new URLSearchParams(searchParams).toString()

        // Navigate to the ticket page with token in route and other info as search params
        router.push(`/ticket/${token}?${queryString}`)
    }

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <h1 className="text-2xl font-bold mb-4">Ticket Information</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" name="date" value={ticketInfo.date} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="nbr" className="block text-sm font-medium text-gray-700">Number</label>
                    <input type="text" id="nbr" name="nbr" value={ticketInfo.nbr} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                    <input type="text" id="type" name="type" value={ticketInfo.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="from" className="block text-sm font-medium text-gray-700">From</label>
                    <input type="text" id="from" name="from" value={ticketInfo.from} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700">To</label>
                    <input type="text" id="to" name="to" value={ticketInfo.to} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="departure" className="block text-sm font-medium text-gray-700">Departure Time</label>
                    <input type="time" id="departure" name="departure" value={ticketInfo.departure} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="arrival" className="block text-sm font-medium text-gray-700">Arrival Time</label>
                    <input type="time" id="arrival" name="arrival" value={ticketInfo.arrival} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required />
                </div>
                <div>
                    <label htmlFor="seat" className="block text-sm font-medium text-gray-700">Seat (N 車 NN 號)</label>
                    <input
                        type="text"
                        id="seat"
                        name="seat"
                        value={ticketInfo.seat}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        pattern="\d+\s\d+"
                        placeholder="例：1 車 05 號，請輸入 1 05"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700">Token (Scan QR Code)</label>
                    <input type="text" id="token" name="token" value={ticketInfo.token} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" readOnly />
                </div>
                {!isScanning ? (
                    <button
                        type="button"
                        onClick={startScanner}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Scan QR Code
                    </button>
                ) : (
                    <div>
                        <div id="reader" className="mb-4"></div>
                        <button
                            type="button"
                            onClick={stopScanner}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Stop Scanning
                        </button>
                    </div>
                )}
                <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    {isEditing ? 'Update Ticket Information' : 'Submit Ticket Information'}
                </button>

                <button
                    type="button"
                    onClick={() => setTicketInfo({
                        date: '',
                        nbr: '',
                        type: '',
                        from: '',
                        to: '',
                        departure: '',
                        arrival: '',
                        seat: '',
                        token: ''
                    })}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Clear Form
                </button>
            </form>
        </div>
    )
}