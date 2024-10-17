"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import QRCodeGenerator from "../../components/QRCodeGenerator";
import 'material-symbols';

interface TicketData {
  id: string;
  // Add other fields as necessary
}

export default function TicketPage() {
  const router = useRouter();
  const params = useParams()
  const token = params.token as string

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
        // const res = await fetch(`https://api.dhsa.ndhu.edu.tw/card/membership/${token}`)
        // const result = await res.json()
        // setData(result)
        setData({ id: token })
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

  const getGoogleCalendarUrl = () => {
    if (!date || !departure || !arrival) return null;

    const departureDate = new Date(`${date} ${departure}`);
    let startDate = new Date(departureDate);

    // Calculate minutes to subtract (10 to 15 minutes)
    let minutesToSubtract = 10;
    let currentMinutes = startDate.getMinutes();

    // Adjust minutes to end with 0 or 5
    while ((currentMinutes - minutesToSubtract) % 5 !== 0 && minutesToSubtract < 15) {
      minutesToSubtract++;
    }

    // If we couldn't find a suitable time in 15 minutes, default to 10 minutes before
    if (minutesToSubtract >= 15) {
      minutesToSubtract = 10;
      currentMinutes = Math.floor(currentMinutes / 5) * 5;
    } else {
      currentMinutes -= minutesToSubtract;
    }

    startDate.setMinutes(currentMinutes);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(`${date} ${arrival}`);
    const event = {
      action: 'TEMPLATE',
      text: `🚃 ${type} ${nbr} ${from}${to}`,
      details: `座位： ${seat}\n開車時間： ${departure}\n抵達時間： ${arrival}\n\n🎟️ ${window.location.href}`,
      dates: `${startDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}/${endDate.toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
    };

    return `https://www.google.com/calendar/render?${new URLSearchParams(event).toString()}`;
  }

  const handleAddToCalendar = () => {
    const url = getGoogleCalendarUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }

  const handleEditClick = () => {
    const queryParams = new URLSearchParams({
      date: date || '',
      nbr: nbr || '',
      type: type || '',
      from: from || '',
      to: to || '',
      departure: departure || '',
      arrival: arrival || '',
      seat: seat || '',
      token: token
    }).toString();
    router.push(`/ticket?${queryParams}`);
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
          <span
            className="material-symbols-outlined cursor-pointer"
            onClick={handleAddToCalendar}
          >
            calendar_add_on
          </span>
          <span
            className="material-symbols-outlined cursor-pointer"
            onClick={handleCopyLink}
          >
            {copied ? 'check' : 'link'}
          </span>
          <span className="material-symbols-outlined cursor-pointer" onClick={handleEditClick}>
            edit
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto text-black">
        <div className="p-4 my-4">
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