'use client'

import { useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DoorClosed, Armchair, Train } from 'lucide-react'

interface CarriageVisualizerProps {
    carriageNumber: string;
    seatNumber: string;
    isVisible?: boolean; // New prop to track if component is visible (card expanded)
}

export default function CarriageVisualizer({ carriageNumber, seatNumber, isVisible = false }: CarriageVisualizerProps) {
    // Parse the user's seat information
    const userSeatNum = parseInt(seatNumber, 10);

    // Refs for scrolling
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const userSeatRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Track if we've already scrolled
    const hasScrolledRef = useRef(false);

    // Determine the number of seats based on the carriage number
    const getCarriageSeats = (carNum: string): number => {
        const carNumber = parseInt(carNum, 10);

        // Special carriages with 52 seats
        if ([8, 9].includes(carNumber)) {
            return 52;
        }

        // Special carriages with 40 seats
        if ([12].includes(carNumber)) {
            return 40;
        }

        // Default to 40 seats for any other carriage
        return 40;
    };

    const totalSeats = useMemo(() => getCarriageSeats(carriageNumber), [carriageNumber]);

    // Calculate the number of sections needed (4 seats per section)
    const totalSections = Math.ceil(totalSeats / 4);

    // Memoize the generateSeats function so it can be used as a dependency
    const generateSeats = useMemo(() => {
        return () => {
            const seats = [];

            for (let section = 0; section < totalSections; section++) {
                const baseNumber = section * 4;

                // Only add seats that are within the total seat count
                const seatSection = {
                    topWindow: baseNumber + 2 <= totalSeats ? baseNumber + 2 : null,    // Top row window seat (2, 6, 10...)
                    topAisle: baseNumber + 4 <= totalSeats ? baseNumber + 4 : null,     // Top row aisle seat (4, 8, 12...)
                    bottomAisle: baseNumber + 3 <= totalSeats ? baseNumber + 3 : null,  // Bottom row aisle seat (3, 7, 11...)
                    bottomWindow: baseNumber + 1 <= totalSeats ? baseNumber + 1 : null  // Bottom row window seat (1, 5, 9...)
                };

                seats.push(seatSection);
            }
            return seats;
        };
    }, [totalSeats, totalSections]);

    const seats = useMemo(() => generateSeats(), [generateSeats]);

    // Calculate min-width based on the number of sections to ensure proper scrolling
    const containerMinWidth = Math.max(350, totalSections * 14 * 4);

    // Determine which end of the carriage the seat is closer to
    const isCloserToFront = useMemo(() => {
        // Using the binary approach: if seat number is greater than half of total seats, it's closer to front
        return userSeatNum > totalSeats / 2;
    }, [userSeatNum, totalSeats]);

    // Effect to scroll to user's seat position when component becomes visible
    useEffect(() => {
        // Only scroll if the component is visible and we haven't scrolled yet
        if (!isVisible || hasScrolledRef.current) return;

        // Short delay to ensure rendering is complete after card expansion
        const timer = setTimeout(() => {
            // Find which type of seat the user has
            let seatType: string | null = null;

            if (userSeatNum % 4 === 2) seatType = 'topWindow';
            else if (userSeatNum % 4 === 4 || userSeatNum % 4 === 0) seatType = 'topAisle';
            else if (userSeatNum % 4 === 3) seatType = 'bottomAisle';
            else if (userSeatNum % 4 === 1) seatType = 'bottomWindow';

            // Get seat ref
            const seatRef = userSeatRefs.current[seatType || ''] || null;

            // If we have both container and seat refs, perform scroll
            if (scrollContainerRef.current && seatRef) {
                const container = scrollContainerRef.current;

                // Calculate position (centering the seat)
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

                // Mark that we've scrolled
                hasScrolledRef.current = true;
            }
        }, 500); // Delay to ensure DOM is ready after expansion animation

        return () => clearTimeout(timer);
    }, [isVisible, userSeatNum, seats]);

    // Reset the scroll flag if the component gets hidden (card collapsed)
    useEffect(() => {
        if (!isVisible) {
            hasScrolledRef.current = false;
        }
    }, [isVisible]);

    return (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Train className="w-4 h-4 text-tr-blue" />
                    <span className="text-tr-blue font-medium">{carriageNumber}號車廂</span>
                </div>
                <span className="text-xs text-gray-500">2+2座位配置 (共{totalSeats}座)</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto"
            >
                {/* Left and right indicators - with conditional highlighting */}
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2/5 
                    ${!isCloserToFront ? 'bg-tr-yellow text-tr-yellow-dark' : 'bg-gray-200 text-gray-500'} 
                    px-1 py-1 rounded-r-full z-10 transition-colors duration-300`}
                >
                    <span className="text-xs pl-1 pr-0.5">尾</span>
                </div>

                <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2/5 
                    ${isCloserToFront ? 'bg-tr-yellow text-tr-yellow-dark' : 'bg-gray-200 text-gray-500'} 
                    px-1 py-1 rounded-l-full z-10 transition-colors duration-300`}
                >
                    <span className="text-xs pl-0.5 pr-1">頭</span>
                </div>

                {/* Top row with labels */}
                <div className="flex justify-between mb-1 text-xs text-gray-400">
                    <span className="pl-2">靠窗</span>
                    <span className="pr-2">靠窗</span>
                </div>

                {/* Seat layout - scrollable container */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-2 scroll-smooth"
                >
                    <div className="flex flex-col" style={{ minWidth: `${containerMinWidth}px` }}>
                        {/* Top row (window seats 2,6,10,14...) */}
                        <div className="flex space-x-1 mb-1">
                            {seats.map((section, idx) => (
                                section.topWindow && (
                                    <div
                                        key={`top-window-${idx}`}
                                        ref={section.topWindow === userSeatNum ?
                                            (el) => { userSeatRefs.current.topWindow = el; } : undefined}
                                        className={`w-12 h-7 flex items-center justify-center rounded text-xs 
                                            ${section.topWindow === userSeatNum ? 'bg-tr-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {section.topWindow}
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Top aisle seats (4,8,12,16...) */}
                        <div className="flex space-x-1 mb-2">
                            {seats.map((section, idx) => (
                                section.topAisle && (
                                    <div
                                        key={`top-aisle-${idx}`}
                                        ref={section.topAisle === userSeatNum ?
                                            (el) => { userSeatRefs.current.topAisle = el; } : undefined}
                                        className={`w-12 h-7 flex items-center justify-center rounded text-xs 
                                            ${section.topAisle === userSeatNum ? 'bg-tr-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {section.topAisle}
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Central aisle */}
                        <div className="relative flex h-5 mb-2">
                            <div className="absolute inset-0 bg-gray-50 rounded-full opacity-70">
                                <div className="z-10 w-full flex justify-center items-center">
                                    <DoorClosed className="w-4 h-4 text-gray-300 -rotate-90 absolute left-4" />
                                    <span className="text-xs text-gray-400">走 道</span>
                                    <DoorClosed className="w-4 h-4 text-gray-300 -rotate-90 absolute right-4" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom aisle seats (3,7,11,15...) */}
                        <div className="flex space-x-1 mb-1">
                            {seats.map((section, idx) => (
                                section.bottomAisle && (
                                    <div
                                        key={`bottom-aisle-${idx}`}
                                        ref={section.bottomAisle === userSeatNum ?
                                            (el) => { userSeatRefs.current.bottomAisle = el; } : undefined}
                                        className={`w-12 h-7 flex items-center justify-center rounded text-xs 
                                            ${section.bottomAisle === userSeatNum ? 'bg-tr-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {section.bottomAisle}
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Bottom row (window seats 1,5,9,13...) */}
                        <div className="flex space-x-1">
                            {seats.map((section, idx) => (
                                section.bottomWindow && (
                                    <div
                                        key={`bottom-window-${idx}`}
                                        ref={section.bottomWindow === userSeatNum ?
                                            (el) => { userSeatRefs.current.bottomWindow = el; } : undefined}
                                        className={`w-12 h-7 flex items-center justify-center rounded text-xs 
                                            ${section.bottomWindow === userSeatNum ? 'bg-tr-blue text-white' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        {section.bottomWindow}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom row with labels */}
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span className="pl-2">靠窗</span>
                    <span className="pr-2">靠窗</span>
                </div>
            </motion.div>

            {/* Current seat indicator with enhanced information */}
            <div className="mt-3 p-2 bg-tr-blue/10 rounded-lg border border-tr-blue/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-tr-blue" />
                    <span className="text-sm text-gray-700">
                        您的座位：
                        <span className="font-medium text-tr-blue">{userSeatNum}號</span>
                        <span className="text-xs text-gray-500 ml-1">
                            (靠近{isCloserToFront ? '車頭' : '車尾'}門)
                        </span>
                    </span>
                </div>
                {userSeatNum % 4 === 2 || userSeatNum % 4 === 1 ? (
                    <span className="text-xs bg-tr-blue/20 text-tr-blue px-2 py-0.5 rounded">靠窗</span>
                ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">走道</span>
                )}
            </div>

            {/* Legend */}
            <div className="mt-2 flex items-center justify-end gap-3">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-tr-blue rounded-sm"></div>
                    <span className="text-xs text-gray-500">您的座位</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                    <span className="text-xs text-gray-500">其他座位</span>
                </div>
            </div>

            {/* Additional info */}
            <div className="mt-2 text-xs text-gray-500 text-center">
                <span>此為示意圖，實際座位配置可能略有不同</span>
            </div>
        </div>
    );
}
