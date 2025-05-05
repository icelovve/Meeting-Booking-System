"use client";

import { useState, useEffect } from "react";
import BookingDate from "../../../components/share/bookings/BookingDate";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus,
    Sparkles,
} from "lucide-react";
import { fetchWithBase } from "@/components/share/utils/fetchWithBase";
import WatchBooking from "@/components/share/bookings/WatchBooking";
import AdminLayout from './../../../components/layouts/AdminLayout';

interface Booking {
    id: number;
    userId: number;
    roomId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
}

interface Event {
    date: string;
    title: string;
    time: string;
    color: string;
    roomId: number;
    bookingId: number;
}

export default function ThaiCalendar() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [animate, setAnimate] = useState(false);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<number | null>(null);

    const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
    ];

    const thaiDays = [
        { short: "จ", full: "จันทร์" },
        { short: "อ", full: "อังคาร" },
        { short: "พ", full: "พุธ" },
        { short: "พฤ", full: "พฤหัสบดี" },
        { short: "ศ", full: "ศุกร์" },
        { short: "ส", full: "เสาร์" },
        { short: "อา", full: "อาทิตย์" },
    ];

    const colorList = [
        "bg-red-700", "bg-green-700", "bg-blue-700", "bg-yellow-700",
        "bg-pink-700", "bg-purple-700", "bg-indigo-700",
        "bg-teal-700", "bg-orange-700",
    ];

    const roomColorMap: Record<string, string> = {};

    const getColorByRoomId = (roomId: string | number) => {
        if (!roomColorMap[roomId]) {
            const nextColor = colorList[Object.keys(roomColorMap).length % colorList.length];
            roomColorMap[roomId] = nextColor;
        }
        return roomColorMap[roomId];
    };

    const events: Event[] = Array.isArray(bookings)
        ? bookings.map((booking) => {
            const formatTime = (time: string) => time.slice(0, 5);
            return {
                date: booking.bookingDate,
                title: `ห้อง ${booking.roomId}`,
                time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`,
                color: getColorByRoomId(booking.roomId),
                roomId: booking.roomId,
                bookingId: booking.id, 
            };
        })
        : [];

    const fetchBookings = async () => {
        try {
            const res = await fetchWithBase("/bookings");
            if (!res.ok) {
                throw new Error("Failed to fetch bookings");
            }
            const data = await res.json();
            setBookings(data.bookings);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setBookings([]);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 300);
        return () => clearTimeout(timer);
    }, [currentMonth, currentYear]);

    const changeMonth = (delta: number) => {
        let newMonth = currentMonth + delta;
        let newYear = currentYear;

        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const getDaysInMonth = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const startDay = new Date(firstDay);
        startDay.setDate(1 - (firstDay.getDay() || 7) + 1);

        const days = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDay);
            day.setDate(startDay.getDate() + i);

            const isCurrentMonth = day.getMonth() === currentMonth;
            const today = new Date();
            const isToday =
                day.getDate() === today.getDate() &&
                day.getMonth() === today.getMonth() &&
                day.getFullYear() === today.getFullYear();

            const dateString = `${day.getFullYear()}-${String(
                day.getMonth() + 1
            ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
            const dayEvents = events.filter((event) => event.date === dateString);

            days.push({
                date: day,
                number: day.getDate(),
                isCurrentMonth,
                isToday,
                events: dayEvents,
            });
        }

        return days;
    };

    const days = getDaysInMonth();

    const handleEventClick = (event: Event) => {
        const booking = bookings.find((b) => b.id === event.bookingId);
        if (booking) {
            setSelectedBooking(booking.id);
            setIsBookingOpen(true);
        }
    };

    return (
        <AdminLayout>
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 w-full max-w-screen-xl transform scale-90">
                <header className="flex flex-col sm:flex-row items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <Calendar className="h-6 w-6 text-cyan-800" />
                        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <time dateTime={`${currentYear}-${currentMonth + 1}`}>
                                {thaiMonths[currentMonth]} {currentYear + 543}
                            </time>
                            {animate && (
                                <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                            )}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="rounded-md shadow-sm border border-gray-200 flex">
                            <button
                                type="button"
                                className="h-10 w-10 flex items-center justify-center rounded-l-md text-gray-500 hover:text-cyan-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-800"
                                onClick={() => changeMonth(-1)}
                            >
                                <span className="sr-only">เดือนก่อนหน้า</span>
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                className="h-10 px-4 text-lg font-medium text-gray-700 hover:text-cyan-800 flex items-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-800"
                                onClick={goToToday}
                            >
                                <Calendar className="h-4 w-4" />
                                <span>วันนี้</span>
                            </button>
                            <button
                                type="button"
                                className="h-10 w-10 flex items-center justify-center rounded-r-md text-gray-500 hover:text-cyan-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-800"
                                onClick={() => changeMonth(1)}
                            >
                                <span className="sr-only">เดือนถัดไป</span>
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => setIsPopUpOpen(true)}
                            type="button"
                            className="rounded-md bg-cyan-800 px-4 py-2.5 text-lg font-medium text-white hover:bg-cyan-900 transition-all duration-200 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-800 focus:ring-offset-1"
                        >
                            <Plus className="h-5 w-5" />
                            <span>จองห้องประชุม</span>
                        </button>
                    </div>
                </header>
                <div
                    className={`transform transition-opacity duration-200 ${animate ? "opacity-80" : "opacity-100"
                        } flex-grow flex flex-col`}
                >
                    <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 bg-gray-100 border-b border-gray-100">
                        {thaiDays.map((day, index) => (
                            <div key={index} className="py-3">
                                <span className="sm:hidden">{day.short}</span>
                                <span className="hidden sm:inline">{day.full}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 grid-rows-6 flex-grow">
                        {days.map((day, index) => (
                            <div
                                key={index}
                                className={`relative p-3 min-h-[120px] border-r border-b border-gray-100
                                    ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                                    ${index % 7 === 6 ? "border-r-0" : ""}
                                    ${Math.floor(index / 7) === 5 ? "border-b-0" : ""}
                                    ${day.isToday ? "ring-1 ring-gray-300 ring-inset z-10" : ""}
                                    hover:bg-gray-100 transition-colors duration-150 cursor-pointer flex flex-col justify-between
                                `}
                            >
                                <time
                                    dateTime={`${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`}
                                    className={`flex h-8 w-8 items-center justify-center text-lg font-medium rounded-full
                                            ${day.isToday
                                            ? "bg-cyan-800 text-white shadow-sm"
                                            : day.isCurrentMonth
                                                ? "text-gray-800"
                                                : "text-gray-400"
                                        }`}
                                >
                                    {day.number}
                                </time>
                                <div className="mt-2 sm:mt-3 flex-grow flex items-start">
                                    {day.events.length > 0 ? (
                                        <ol className="space-y-1 w-full">
                                            {day.events.map((event, eventIndex) => (
                                                <li key={eventIndex}>
                                                    <a
                                                        onClick={() => handleEventClick(event)}
                                                        className={`flex text-sm rounded-md px-2 py-1 ${event.color} hover:opacity-90 transition-all duration-150 truncate w-full cursor-pointer`}
                                                    >
                                                        <time
                                                            dateTime={`${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}T${event.time}`}
                                                            className="ml-1.5 hidden sm:flex items-center gap-1 text-white "
                                                        >
                                                            <Clock className="h-4 w-4" />
                                                            {event.time}
                                                        </time>
                                                    </a>
                                                </li>
                                            ))}
                                        </ol>
                                    ) : (
                                        <div className="h-8"></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {
                isPopUpOpen && (
                    <BookingDate
                        onClose={() => setIsPopUpOpen(false)}
                        fetchBookings={fetchBookings}
                    />
                )
            }
            {
                isBookingOpen && selectedBooking && (
                    <WatchBooking
                        bookingId={selectedBooking}
                        onClose={() => {
                            setIsBookingOpen(false);
                            setSelectedBooking(null);
                        }}
                    />
                )
            }
        </AdminLayout >
    );
}