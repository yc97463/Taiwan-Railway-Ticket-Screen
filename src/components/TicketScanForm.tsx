'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    ScanLine,
    Calendar,
    Train,
    Clock,
    MapPin,
    Armchair,
    Plus,
    X,
    Save,
    RotateCcw,
    Check,
    QrCode
} from 'lucide-react'
import { motion } from 'motion/react'

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* 掃描區域 */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-6 bg-tr-blue rounded-full"></span>
                    條碼掃描
                </h2>
                <div className="bg-gray-50 rounded-xl p-4">
                    {ticketInfo.token && !isScanning ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-4 bg-tr-blue/10 border border-tr-blue/20 rounded-lg"
                        >
                            <div className="flex items-center gap-3 mb-2 text-tr-blue">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                >
                                    <Check className="w-6 h-6 p-1 bg-tr-blue text-white rounded-full" />
                                </motion.div>
                                <div className="font-medium">已掃描條碼</div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-tr-blue/70" />
                                    <code className="bg-white px-3 py-1.5 rounded border border-tr-blue/20 text-gray-700 font-mono">
                                        {ticketInfo.token.length > 24
                                            ? ticketInfo.token.substring(0, 24) + '...'
                                            : ticketInfo.token}
                                    </code>
                                </div>
                                <button
                                    type="button"
                                    onClick={startScanner}
                                    className="text-sm px-3 py-1 bg-tr-blue text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                                >
                                    <ScanLine className="w-4 h-4" />
                                    重新掃描
                                </button>
                            </div>
                        </motion.div>
                    ) : null}

                    {!isScanning ? (
                        !ticketInfo.token && (
                            <button
                                type="button"
                                onClick={startScanner}
                                className="w-full py-4 px-6 rounded-xl border-2 border-dashed border-gray-300 
                                        hover:border-tr-blue hover:bg-tr-blue/5 transition-colors duration-200
                                        flex items-center justify-center gap-3 text-gray-600 hover:text-tr-blue"
                            >
                                <ScanLine className="w-6 h-6" />
                                點擊開始掃描 QR Code
                            </button>
                        )
                    ) : (
                        <div className="space-y-4">
                            <div id="reader" className="overflow-hidden rounded-lg"></div>
                            <button
                                type="button"
                                onClick={stopScanner}
                                className="w-full py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 
                                        text-white transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <X className="w-5 h-5" />
                                停止掃描
                            </button>
                        </div>
                    )}
                    <input type="text" id="token" name="token" value={ticketInfo.token}
                        className="sr-only" readOnly />
                </div>
            </div>

            {/* 基本資訊 */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-6 bg-tr-orange rounded-full"></span>
                    基本資訊
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            日期
                        </label>
                        <input type="date" name="date" value={ticketInfo.date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <Train className="w-4 h-4" />
                            車種
                        </label>
                        <select name="type" value={ticketInfo.type}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                         focus:ring-2 focus:ring-tr-blue focus:border-transparent">
                            <option value="">選擇車種</option>
                            <option value="自強3000">自強3000</option>
                            <option value="區間">區間車</option>
                            <option value="區間快">區間快</option>
                            <option value="莒光">莒光號</option>
                            <option value="自強">舊自強號</option>
                            <option value="普悠瑪">普悠瑪</option>
                            <option value="太魯閣">太魯閣</option>
                            <option value="復興">復興號</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            車次
                        </label>
                        <input type="text" name="nbr" value={ticketInfo.nbr}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <Armchair className="w-4 h-4" />
                            座位
                        </label>
                        <input type="text" name="seat" value={ticketInfo.seat}
                            onChange={handleInputChange}
                            placeholder="1 05"
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                </div>
            </div>

            {/* 行程資訊 */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-1 h-6 bg-tr-yellow rounded-full"></span>
                    行程資訊
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            起站
                        </label>
                        <input type="text" name="from" value={ticketInfo.from}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            迄站
                        </label>
                        <input type="text" name="to" value={ticketInfo.to}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            出發時間
                        </label>
                        <input type="time" name="departure" value={ticketInfo.departure}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            抵達時間
                        </label>
                        <input type="time" name="arrival" value={ticketInfo.arrival}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 
                                        focus:ring-2 focus:ring-tr-blue focus:border-transparent" />
                    </div>
                </div>
            </div>

            {/* 按鈕群組 */}
            <div className="flex gap-4 pt-4">
                <button type="submit"
                    className="flex-1 bg-tr-blue text-white py-3 px-6 rounded-xl
                                 hover:bg-blue-600 transition-colors duration-200 font-medium
                                 flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    {isEditing ? '更新車票資訊' : '建立車票'}
                </button>
                <button type="button"
                    onClick={() => setTicketInfo({
                        date: '', nbr: '', type: '', from: '', to: '',
                        departure: '', arrival: '', seat: '', token: ''
                    })}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600
                             hover:bg-gray-50 transition-colors duration-200
                             flex items-center justify-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    清除表單
                </button>
            </div>
        </form>
    )
}