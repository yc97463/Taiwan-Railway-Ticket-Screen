"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import QRCodeGenerator from "../../components/QRCodeGenerator";
import 'material-symbols';

interface TicketData {
  // Define the structure of your ticket data here
  // For example:
  id: string;
  // Add other fields as necessary
}

export default function TicketPage() {
  const router = useRouter();
  const params = useParams()
  const token = params.token as string

  // Train information from query params
  const searchParams = useSearchParams()
  const date = searchParams.get("date")
  const nbr = searchParams.get("nbr")
  const type = searchParams.get("type")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const departure = searchParams.get("departure")
  const arrival = searchParams.get("arrival")
  const seat = searchParams.get("seat")

  const [data, setData] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeWidth, setQRCodeWidth] = useState(200)

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`https://api.dhsa.ndhu.edu.tw/card/membership/${token}`)
        const result = await res.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  const handleBackClick = () => {
    router.push('/ticket');
  }

  const toggleQRCodeSize = () => {
    setQRCodeWidth(prevWidth => prevWidth === 200 ? 250 : 200);
  }

  if (loading) return <div className="max-w-3xl mx-auto p-4">Loading...</div>
  if (error) return <div className="max-w-3xl mx-auto p-4">Error: {error}</div>
  if (!data) return <div className="max-w-3xl mx-auto p-4">No data found</div>

  return (
    <div className="max-w-[400px] mx-auto bg-white h-screen flex flex-col">
      <div className="flex justify-between items-center bg-tr-blue p-4 text-white">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined cursor-pointer"
            onClick={handleBackClick}
          >
            arrow_back_ios
          </span>
          <h1 className="text-xl font-bold">乘車條碼</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined">
            calendar_add_on
          </span>
          <span
            className="material-symbols-outlined cursor-pointer"
            onClick={handleCopyLink}
          >
            {copied ? 'check' : 'link'}
          </span>
          <span className="material-symbols-outlined">
            edit
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto text-black">
        <div className="p-4 my-4">
          {/* <p><span className="text-tr-orange">自強(3000)</span> 283 2024/05/03 </p>
          <p>志學 17:34 - 臺北 20:12</p> */}

          <p><span className="text-tr-orange">{type}({nbr})</span> {date}</p>
          <p>{from} {departure} - {to} {arrival}</p>
          <p>座位: {seat}</p>
        </div>
        <div className="p-4 m-4 bg-gray-100 rounded-lg">
          <p className="text-tr-blue text-center my-2">限當日當次車有效</p>
          <div
            onClick={toggleQRCodeSize}
            className="cursor-pointer transition-all duration-300 ease-in-out"
          >
            <QRCodeGenerator text={token} width={qrCodeWidth} />
          </div>
          {/* <p className="text-center text-sm mt-2">Current QR Code width: {qrCodeWidth}px</p> */}
        </div>
        <div className="bg-tr-yellow p-4">
          行程資訊
        </div>
        <div className="p-4">
          這裡放起訖站和誤點資訊
        </div>
      </div>
    </div>
  );
}