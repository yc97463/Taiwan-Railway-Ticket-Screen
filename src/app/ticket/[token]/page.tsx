"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import QRCodeGenerator from "../../components/QRCodeGenerator"
import {
  ArrowLeft,
  CalendarPlus,
  Link,
  Check,
  Edit,
  Calendar,
  ArrowRight,
  Train,
  Info,
  Armchair
} from "lucide-react"

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
  const formated = date ? date.replace(/-/g, '/') : '';
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

  // Format seat for display
  const formatSeat = (seatString: string | null): string => {
    if (!seatString) return '';
    const [carriage, seatNumber] = seatString.split(' ');
    return `${carriage} 車 ${seatNumber.padStart(2, '0')} 號`;
  }

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
    const startDate = new Date(departureDate);

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
      details: `座位： ${formatSeat(seat)}\n開車時間： ${departure}\n抵達時間： ${arrival}\n\n🎟️ ${window.location.href}`,
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
          <ArrowLeft
            className="cursor-pointer w-5 h-5"
            onClick={handleBackClick}
          />
          <h1 className="text-xl font-bold">乘車條碼</h1>
        </div>
        <div className="flex items-center gap-3">
          <CalendarPlus
            className="cursor-pointer w-5 h-5"
            onClick={handleAddToCalendar}
          />
          {copied ? (
            <Check className="cursor-pointer w-5 h-5" />
          ) : (
            <Link
              className="cursor-pointer w-5 h-5"
              onClick={handleCopyLink}
            />
          )}
          <Edit
            className="cursor-pointer w-5 h-5"
            onClick={handleEditClick}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto text-black">
        <div className="p-6 space-y-6">
          {/* 車票基本資訊卡片 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Train className="w-5 h-5 text-tr-orange" />
                <span className="text-tr-orange font-medium text-lg">{type}</span>
                <span className="text-gray-600">#{nbr}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{date}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="text-center">
                  <p className="text-gray-500 text-sm">出發</p>
                  <p className="font-medium text-lg">{from}</p>
                  <p className="text-tr-blue font-medium">{departure}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <div className="text-center">
                  <p className="text-gray-500 text-sm">抵達</p>
                  <p className="font-medium text-lg">{to}</p>
                  <p className="text-tr-blue font-medium">{arrival}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <Armchair className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">座位：{formatSeat(seat)}</span>
              </div>
            </div>
          </div>

          {/* QR Code 區域 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="text-center space-y-4">
              <p className="text-tr-blue font-medium bg-tr-blue/10 py-2 px-4 rounded-full inline-block">
                限當日當次車有效
              </p>
              <div
                onClick={toggleQRCodeSize}
                className="cursor-pointer transition-all duration-300 ease-in-out bg-white p-4 rounded-lg inline-block shadow-sm"
              >
                <QRCodeGenerator text={token} width={qrCodeWidth} />
              </div>
              <p className="text-gray-500 text-sm">點擊可放大/縮小 QR Code</p>
            </div>
          </div>

          {/* 行程資訊標題 */}
          <div className="bg-tr-yellow/10 border-l-4 border-tr-yellow p-4 rounded-r-lg">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-tr-yellow" />
              <span className="font-medium text-gray-700">行程資訊</span>
            </div>
          </div>

          <div className="p-4">
            <a
              href={`https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/querybytrainno?rideDate=${formated}&trainNo=${nbr}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-tr-blue text-white py-3 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors duration-200"
            >
              🚃 查看即時動態
            </a>
          </div>
          <div className="p-4">
            這裡放起訖站和誤點資訊
          </div>
        </div>
      </div>
    </div>
  );
}