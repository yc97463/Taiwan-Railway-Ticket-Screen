'use client'

import { useMemo, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { DoorClosed, Armchair, Train, ArrowLeft, ArrowRight } from 'lucide-react'

// Types
interface CarriageVisualizerProps {
    carriageNumber: string;
    seatNumber: string;
    isVisible?: boolean;
    onSeatSelect?: (seatNumber: string) => void;
    isMobileView?: boolean; // Add property for mobile-specific adjustments
}

interface SeatSection {
    topWindow: number | null;
    topAisle: number | null;
    bottomAisle: number | null;
    bottomWindow: number | null;
}

type SeatType = 'topWindow' | 'topAisle' | 'bottomAisle' | 'bottomWindow';

// Helper components
const SeatRow = ({
    seats,
    userSeatNum,
    seatType,
    seatRefs,
    onSeatSelect,
    isMobileView
}: {
    seats: SeatSection[],
    userSeatNum: number,
    seatType: SeatType,
    seatRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>,
    onSeatSelect?: (seatNum: string) => void,
    isMobileView?: boolean
}) => (
    <div className="flex space-x-1 my-0.5">
        {seats.map((section, idx) => {
            const seatNum = section[seatType];
            if (!seatNum) return null;

            return (
                <div
                    key={`${seatType}-${idx}`}
                    ref={seatNum === userSeatNum ?
                        (el) => { seatRefs.current[seatType] = el; } : undefined}
                    className={`w-12 h-7 ${isMobileView ? 'h-8' : 'h-7'} flex items-center justify-center rounded text-xs 
                        ${seatNum === userSeatNum ? 'bg-tr-blue text-white' : 'bg-gray-100 text-gray-600'}
                        ${onSeatSelect ? 'cursor-pointer hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300' : ''}`}
                    onClick={() => onSeatSelect && onSeatSelect(seatNum.toString())}
                >
                    {seatNum}
                </div>
            );
        })}
    </div>
);

const CarriageHeader = ({
    carriageNumber,
    totalSeats,
    // isReversedCarriage
}: {
    carriageNumber: string,
    totalSeats: number,
    isReversedCarriage: boolean
}) => (
    <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-tr-blue" />
            <span className="text-tr-blue font-medium">{carriageNumber} 號車廂</span>
        </div>
        <span className="text-xs text-gray-500">
            {/* {"2+2 座位配置 "} */}
            共 {totalSeats} 座
            {/* {isReversedCarriage ? ' - 逆向編號' : ''} */}
        </span>
    </div>
);

const CarriageAisle = () => (
    <div className="w-full my-1 relative">
        <div className="h-8 bg-gray-50 rounded-full opacity-70">
            <div className="w-full h-full flex justify-center items-center">
                <DoorClosed className="w-4 h-4 text-gray-300 absolute left-12" />
                <span className="text-xs text-gray-400">走 道</span>
                <DoorClosed className="w-4 h-4 text-gray-300 absolute right-12" />
            </div>
        </div>
    </div>
);

const CarriageIndicators = ({
    carriageNum,
    isReversedCarriage,
    isCloserToFront
}: {
    carriageNum: number,
    isReversedCarriage: boolean,
    isCloserToFront: boolean
}) => {
    // For reversed carriages (9-12), we need to flip both the label content AND the highlighting logic
    // This ensures that both text and colors are correctly swapped
    const leftHighlighted = isReversedCarriage ? isCloserToFront : !isCloserToFront;
    const rightHighlighted = isReversedCarriage ? !isCloserToFront : isCloserToFront;

    return (
        <>
            {/* Left indicator - showing previous carriage or driver's cabin */}
            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2/5 
                ${leftHighlighted ? 'bg-tr-yellow text-tr-yellow-dark' : 'bg-gray-200 text-gray-500'} 
                px-1 py-1 rounded-r-full z-10 transition-colors duration-300`}
            >
                <span className="text-xs pl-0 pr-1 flex items-center justify-center gap-0.5">
                    <ArrowLeft className="w-3" />
                    <span>
                        {isReversedCarriage ?
                            // For carriages 9-12, flip the labels
                            (carriageNum === 12 ? '駕駛室' : `${carriageNum + 1} 車`) :
                            // For carriages 1-8, normal display
                            (carriageNum === 1 ? '駕駛室' : `${carriageNum - 1} 車`)}
                    </span>
                </span>
            </div>

            {/* Right indicator - showing next carriage or driver's cabin */}
            <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2/5 
                ${rightHighlighted ? 'bg-tr-yellow text-tr-yellow-dark' : 'bg-gray-200 text-gray-500'} 
                px-1 py-1 rounded-l-full z-10 transition-colors duration-300`}
            >
                <span className="text-xs pl-1 pr-0 flex items-center justify-center gap-0.5">
                    <span>
                        {isReversedCarriage ?
                            // For carriages 9-12, flip the labels
                            (carriageNum === 1 ? '駕駛室' : `${carriageNum - 1} 車`) :
                            // For carriages 1-8, normal display
                            (carriageNum === 12 ? '駕駛室' : `${carriageNum + 1} 車`)}
                    </span>
                    <ArrowRight className="w-3" />
                </span>
            </div>
        </>
    );
};

const SeatIndicator = ({ userSeatNum }: { userSeatNum: number }) => (
    <div className="mt-3 p-2 bg-tr-blue/10 rounded-lg border border-tr-blue/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Armchair className="w-4 h-4 text-tr-blue" />
            <span className="text-sm text-gray-700">
                您的座位：
                <span className="font-medium text-tr-blue">{userSeatNum} 號</span>
            </span>
        </div>
        {userSeatNum % 4 === 2 || userSeatNum % 4 === 1 ? (
            <span className="text-xs bg-tr-blue/20 text-tr-blue px-2 py-0.5 rounded">靠窗</span>
        ) : (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">走道</span>
        )}
    </div>
);

const Legend = () => (
    <>
        <div className="mt-2 flex items-center justify-end gap-3">
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-tr-yellow rounded-sm"></div>
                <span className="text-xs text-gray-500">此門上車</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-tr-blue rounded-sm"></div>
                <span className="text-xs text-gray-500">您的座位</span>
            </div>
            <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm border"></div>
                <span className="text-xs text-gray-500">其他座位</span>
            </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
            <span>此為示意圖，實際座位配置可能略有不同</span>
        </div>
    </>
);

// Main component
export default function CarriageVisualizer({
    carriageNumber,
    seatNumber,
    isVisible = false,
    onSeatSelect,
    isMobileView = false
}: CarriageVisualizerProps) {
    // Parse user's seat information
    const userSeatNum = seatNumber ? parseInt(seatNumber, 10) : 0;
    const carriageNum = parseInt(carriageNumber, 10);

    // Carriage configuration
    const isReversedCarriage = useMemo(() => carriageNum >= 9 && carriageNum <= 12, [carriageNum]);

    // Scrolling references
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const userSeatRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const hasScrolledRef = useRef(false);

    // Get carriage seat count based on carriage number
    const getCarriageSeats = (carNum: string): number => {
        const carNumber = parseInt(carNum, 10);

        if ([2, 4, 5, 8, 9, 10, 11].includes(carNumber)) return 52; // 52-seat carriages
        if ([1, 3, 6, 12].includes(carNumber)) return 40; // 40-seat carriages
        if ([7].includes(carNumber)) return 28; // 28-seat carriages

        return 40; // Default
    };

    const totalSeats = useMemo(() => getCarriageSeats(carriageNumber), [carriageNumber]);
    const totalSections = Math.ceil(totalSeats / 4);

    // Generate seat data
    const generateSeats = useMemo(() => {
        return () => {
            const seats: SeatSection[] = [];

            for (let section = 0; section < totalSections; section++) {
                const baseNumber = section * 4;

                seats.push({
                    topWindow: baseNumber + 2 <= totalSeats ? baseNumber + 2 : null,
                    topAisle: baseNumber + 4 <= totalSeats ? baseNumber + 4 : null,
                    bottomAisle: baseNumber + 3 <= totalSeats ? baseNumber + 3 : null,
                    bottomWindow: baseNumber + 1 <= totalSeats ? baseNumber + 1 : null
                });
            }
            return seats;
        };
    }, [totalSeats, totalSections]);

    const seats = useMemo(() => generateSeats(), [generateSeats]);
    const containerMinWidth = useMemo(() => {
        const baseWidth = Math.max(300, totalSections * 14 * 4);
        return isMobileView ? Math.min(baseWidth, window.innerWidth - 40) : baseWidth;
    }, [totalSections, isMobileView]);

    // Determine which end of carriage the seat is closer to
    const isCloserToFront = useMemo(() => {
        // Default to center if no seat is selected
        if (!userSeatNum) return false;

        if (isReversedCarriage) {
            return userSeatNum < totalSeats / 2; // Reversed for 9-12 carriages
        }
        return userSeatNum > totalSeats / 2; // Normal for other carriages
    }, [userSeatNum, totalSeats, isReversedCarriage]);

    // Scroll to user's seat when component becomes visible
    useEffect(() => {
        // Don't scroll if no seat is selected or component not visible
        if (!isVisible || hasScrolledRef.current || !userSeatNum) return;

        const timer = setTimeout(() => {
            // Determine seat type based on seat number
            let seatType: SeatType | null = null;

            if (userSeatNum % 4 === 2) seatType = 'topWindow';
            else if (userSeatNum % 4 === 4 || userSeatNum % 4 === 0) seatType = 'topAisle';
            else if (userSeatNum % 4 === 3) seatType = 'bottomAisle';
            else if (userSeatNum % 4 === 1) seatType = 'bottomWindow';

            // Get seat ref and scroll container
            const seatRef = seatType ? userSeatRefs.current[seatType] : null;
            const container = scrollContainerRef.current;

            if (container && seatRef) {
                // Calculate scroll position to center the seat
                const seatRect = seatRef.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const scrollLeft = (
                    seatRect.left -
                    containerRect.left -
                    (containerRect.width / 2) +
                    (seatRect.width / 2) +
                    container.scrollLeft
                );

                // Smooth scroll to position
                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });

                hasScrolledRef.current = true;
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [isVisible, userSeatNum, seats]);

    // Reset scroll flag if component is hidden
    useEffect(() => {
        if (!isVisible) {
            hasScrolledRef.current = false;
        }
    }, [isVisible]);

    return (
        <div className={`${isMobileView ? 'mt-0' : 'mt-4'} bg-gray-50 p-4 rounded-lg`}>
            <CarriageHeader
                carriageNumber={carriageNumber}
                totalSeats={totalSeats}
                isReversedCarriage={isReversedCarriage}
            />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative bg-white border border-gray-200 rounded-lg p-4 overflow-hidden"
            >
                {/* Fixed navigation indicators */}
                <CarriageIndicators
                    carriageNum={carriageNum}
                    isReversedCarriage={isReversedCarriage}
                    isCloserToFront={isCloserToFront}
                />

                {/* Window labels */}
                <div className="flex justify-between mb-1 text-xs text-gray-400">
                    <span className="pl-2">靠窗</span>
                    <span className="pr-2">靠窗</span>
                </div>

                {/* Scrollable seat layout - now includes the aisle */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-2 scroll-smooth"
                >
                    <div className="flex flex-col" style={{ minWidth: `${containerMinWidth}px` }}>
                        {/* Top row seats */}
                        <SeatRow
                            seats={seats}
                            userSeatNum={userSeatNum}
                            seatType="topWindow"
                            seatRefs={userSeatRefs}
                            onSeatSelect={onSeatSelect}
                            isMobileView={isMobileView}
                        />
                        <SeatRow
                            seats={seats}
                            userSeatNum={userSeatNum}
                            seatType="topAisle"
                            seatRefs={userSeatRefs}
                            onSeatSelect={onSeatSelect}
                            isMobileView={isMobileView}
                        />

                        {/* Aisle now moves with the seats */}
                        <CarriageAisle />

                        {/* Bottom row seats */}
                        <SeatRow
                            seats={seats}
                            userSeatNum={userSeatNum}
                            seatType="bottomAisle"
                            seatRefs={userSeatRefs}
                            onSeatSelect={onSeatSelect}
                            isMobileView={isMobileView}
                        />
                        <SeatRow
                            seats={seats}
                            userSeatNum={userSeatNum}
                            seatType="bottomWindow"
                            seatRefs={userSeatRefs}
                            onSeatSelect={onSeatSelect}
                            isMobileView={isMobileView}
                        />
                    </div>
                </div>

                {/* Window labels */}
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span className="pl-2">靠窗</span>
                    <span className="pr-2">靠窗</span>
                </div>
            </motion.div>

            {/* Seat indicator - only shown when not in selection mode and a seat is selected */}
            {!onSeatSelect && userSeatNum > 0 && <SeatIndicator userSeatNum={userSeatNum} />}

            {/* Instructions based on whether a seat is selected */}
            {onSeatSelect && (
                <div className="mt-3 text-center text-sm text-gray-600">
                    點擊座位號碼來選擇您的座位
                </div>
            )}

            {/* Legend */}
            {!isMobileView && <Legend />}
            {isMobileView && (
                <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-tr-yellow rounded-sm"></div>
                        <span className="text-xs text-gray-500">此門上車</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-tr-blue rounded-sm"></div>
                        <span className="text-xs text-gray-500">您的座位</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-sm border"></div>
                        <span className="text-xs text-gray-500">其他座位</span>
                    </div>
                </div>
            )}
        </div>
    );
}
