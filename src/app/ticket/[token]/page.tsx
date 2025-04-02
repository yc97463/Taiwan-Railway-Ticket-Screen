"use client"

import { useParams, useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import QRCodeGenerator from "@/components/QRCodeGenerator"
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
  Armchair,
  EyeOff,
  Eye,
  QrCode
} from "lucide-react"
import { motion } from "framer-motion"
import CarriageVisualizer from "@/components/CarriageVisualizer"

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
  const [ticketDataLoading, setTicketDataLoading] = useState(true)
  const [statusDataLoading, setStatusDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrCodeBlurred, setQrCodeBlurred] = useState(false)
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const toggleCard = () => {
    setIsCardExpanded(!isCardExpanded);
  };

  // Format seat for display
  const formatSeat = (seatString: string | null): string => {
    if (!seatString) return '';
    const [carriage, seatNumber] = seatString.split(' ');
    return `${carriage} 車 ${seatNumber.padStart(2, '0')} 號`;
  }

  // Parse seat information for CarriageVisualizer
  const getCarriageAndSeatNumber = () => {
    if (!seat) return { carriageNumber: '1', seatNumber: '1' };

    const parts = seat.split(' ');
    return {
      carriageNumber: parts[0] || '1',
      seatNumber: parts[1] || '1',
    };
  };

  useEffect(() => {
    if (!token) {
      return
    }

    const fetchTicketData = async () => {
      try {
        setTimeout(() => {
          setData({ id: token });
          setTicketDataLoading(false);
          console.log(data);
        }, 800);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        setTicketDataLoading(false);
      }
    }

    const fetchStatusData = async () => {
      try {
        // Simulate fetching status data
        setTimeout(() => {
          setStatusDataLoading(false);
        }, 1500);
      } catch (err) {
        console.log(err);
        setStatusDataLoading(false);
      }
    }

    fetchTicketData();
    fetchStatusData();
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

  const toggleQRCodeVisibility = () => {
    setQrCodeBlurred(!qrCodeBlurred);
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

  // Ticket info skeleton component when loading
  const TicketSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gray-200"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="text-center">
            <div className="h-3 w-12 bg-gray-200 rounded mb-2 mx-auto"></div>
            <div className="h-4 w-14 bg-gray-200 rounded mb-2 mx-auto"></div>
            <div className="h-4 w-14 bg-gray-200 rounded mx-auto"></div>
          </div>
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="text-center">
            <div className="h-3 w-12 bg-gray-200 rounded mb-2 mx-auto"></div>
            <div className="h-4 w-14 bg-gray-200 rounded mb-2 mx-auto"></div>
            <div className="h-4 w-14 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  // QR Code skeleton
  const QRSkeleton = () => (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="text-center space-y-4">
        <div className="h-6 w-36 bg-gray-200 rounded-full mx-auto"></div>
        <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
          <div className="w-[200px] h-[200px] bg-gray-200 rounded-md"></div>
        </div>
        <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
        <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  );

  // Status skeleton
  const StatusSkeleton = () => (
    <div className="p-4 animate-pulse">
      <div className="h-12 w-full bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
    </div>
  );

  if (error) return <div className="max-w-3xl mx-auto p-4">Error: {error}</div>

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-[400px] mx-auto bg-white h-screen flex flex-col"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center bg-tr-blue p-4 text-white"
      >
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.9 }}>
            <ArrowLeft
              className="cursor-pointer w-5 h-5"
              onClick={handleBackClick}
            />
          </motion.div>
          <h1 className="text-xl font-bold">乘車條碼</h1>
        </div>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>
            <CalendarPlus
              className="cursor-pointer w-5 h-5"
              onClick={handleAddToCalendar}
            />
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>
            {copied ? (
              <Check className="cursor-pointer w-5 h-5" />
            ) : (
              <Link
                className="cursor-pointer w-5 h-5"
                onClick={handleCopyLink}
              />
            )}
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.9 }}>
            <Edit
              className="cursor-pointer w-5 h-5"
              onClick={handleEditClick}
            />
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-auto text-black"
      >
        <div className="p-6 space-y-6">
          {/* 車票基本資訊卡片 */}
          {ticketDataLoading ? (
            <TicketSkeleton />
          ) : (
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.5 }}
              onClick={toggleCard}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer"
            >
              {/* Collapsed view showing only train number and seat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Train className={`w-5 h-5 ${isCardExpanded ? "text-tr-orange" : "text-tr-blue"} transition-colors duration-300`} />
                  <span className={`${isCardExpanded ? "text-tr-orange" : "text-tr-blue"} font-medium text-lg transition-colors duration-300`}>
                    {type} <span className="text-gray-600">#{nbr}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Armchair className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 text-sm">{formatSeat(seat)}</span>

                  <motion.div
                    animate={{ rotate: isCardExpanded ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                </div>
              </div>

              {/* Expandable content */}
              <motion.div
                initial={false}
                animate={{
                  height: isCardExpanded ? "auto" : 0,
                  opacity: isCardExpanded ? 1 : 0,
                  marginTop: isCardExpanded ? 16 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{date}</span>
                  </div>

                  <div className="flex items-center justify-between px-10 py-2">
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

                  {/* Add CarriageVisualizer inside expandable content */}
                  {seat && (
                    <CarriageVisualizer
                      carriageNumber={getCarriageAndSeatNumber().carriageNumber}
                      seatNumber={getCarriageAndSeatNumber().seatNumber}
                      isVisible={isCardExpanded} // Pass the expanded state to control scrolling
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* QR Code 區域 */}
          {ticketDataLoading ? (
            <QRSkeleton />
          ) : (
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <div className="text-center space-y-4">
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-tr-blue font-medium bg-tr-blue/10 py-2 px-4 rounded-full inline-block"
                >
                  限當日當次車有效
                </motion.p>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleQRCodeVisibility}
                  className="relative cursor-pointer transition-all duration-300 ease-in-out bg-white p-4 rounded-lg inline-block shadow-sm"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className={qrCodeBlurred ? "filter blur-md transition-all duration-300" : "transition-all duration-300"}
                  >
                    <QRCodeGenerator text={token} width={200} />
                  </motion.div>

                  {qrCodeBlurred && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg"
                    >
                      <Eye className="w-12 h-12 text-white drop-shadow-md" />
                    </motion.div>
                  )}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500 text-sm"
                >
                  {qrCodeBlurred ? "按一下顯示 QR Code" : "按一下隱藏 QR Code"}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-gray-100 py-3 px-4 rounded-lg inline-flex items-center gap-2 max-w-full w-full overflow-hidden relative"
                >
                  <QrCode className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <code className={`text-sm font-mono text-gray-600 overflow-x-auto scrollbar-hide whitespace-nowrap ${qrCodeBlurred ? "filter blur-md" : ""} transition-all duration-300`}>
                    {qrCodeBlurred ? "••••••••••••••••••••••••" : token}
                  </code>
                  {qrCodeBlurred && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`absolute inset-0 flex items-center justify-center ${qrCodeBlurred ? "cursor-pointer" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleQRCodeVisibility();
                      }}
                    >
                      <Eye className="w-5 h-5 text-gray-500 ml-6" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* 行程資訊標題 */}
          <motion.div
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-tr-yellow/10 border-l-4 border-tr-yellow p-4 rounded-r-lg"
          >
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-tr-yellow" />
              <span className="font-medium text-gray-700">行程資訊</span>
            </div>
          </motion.div>

          {statusDataLoading ? (
            <StatusSkeleton />
          ) : (
            <>
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-4"
              >
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={`https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/querybytrainno?rideDate=${formated}&trainNo=${nbr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-tr-blue text-white py-3 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors duration-200"
                >
                  🚃 查看即時動態
                </motion.a>
              </motion.div>
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="p-4"
              >
                這裡放起訖站和誤點資訊
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}