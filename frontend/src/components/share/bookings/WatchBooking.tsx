'use client';

import { useState, useEffect } from "react";
import { fetchWithBase } from "../utils/fetchWithBase";
import { Calendar, Clock, User, MapPin, Users, Phone, Briefcase, Trash2 } from "lucide-react";

interface Booking {
    id: number;
    userId: number;
    roomId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    user: {
        id: number;
        name: string;
        phone: string;
        position: string;
    };
    room: {
        id: number;
        name: string;
        description: string;
        capacity: number;
    };
}

interface WatchBookingProps {
    bookingId: number;
    fetchBookings: () => Promise<void> | void;
    onClose: () => void;
}

export default function WatchBooking({ bookingId, onClose, fetchBookings }: WatchBookingProps) {
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        try {
            const role = localStorage.getItem("role");
            setUserRole(role);
        } catch (err) {
            console.error("Error getting role from localStorage:", err);
        }
    }, []);

    const fetchBooking = async () => {
        setLoading(true);
        try {
            const res = await fetchWithBase(`/bookings/${bookingId}`);
            const data = await res.json();
            setBooking(data.booking);
        } catch (err) {
            console.error('Error fetching booking:', err);
            setBooking(null);
            setError(true)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const formatDate = (date: string) => {
        if (!date) return '-';
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${parseInt(year) + 543}`;
    };

    const formatTime = (time: string) => {
        if (!time) return '-';
        return time.slice(0, 5);
    };

    const getDurationInHours = () => {
        if (!booking?.startTime || !booking?.endTime) return '-';

        const start = new Date(`2000-01-01T${booking.startTime}`);
        const end = new Date(`2000-01-01T${booking.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);

        return diffHrs.toFixed(1);
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetchWithBase(`/bookings/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete booking");
            }

            // Close the modal first
            onClose();

            // Then refresh the bookings if fetchBookings is a function
            if (typeof fetchBookings === 'function') {
                fetchBookings();
            }
        } catch (error) {
            console.error("Error deleting booking:", error);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
                    <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 py-5 px-6">
                        <div className="h-6 w-48 bg-white/20 rounded animate-pulse"></div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-6 w-40 bg-gray-300 rounded animate-pulse"></div>
                            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="flex gap-3 py-4 border-t border-b">
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-5 w-28 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-5 w-32 bg-gray-300 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-5 w-40 bg-gray-300 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end">
                        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 py-5 px-6">
                        <h2 className="text-lg font-medium text-white">ไม่พบข้อมูลการจอง</h2>
                    </div>
                    <div className="p-6 text-center py-10">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-600">ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง</p>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 py-5 px-6">
                        <h2 className="text-lg font-medium text-white">ไม่พบข้อมูลการจอง</h2>
                    </div>
                    <div className="p-6 text-center py-10">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-600">ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง</p>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
                <div className="bg-cyan-800 py-5 px-6">
                    <h2 className="text-xl font-semibold text-white">รายละเอียดการจอง</h2>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-cyan-800 p-2 rounded-lg">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-cyan-800 uppercase tracking-wider">ห้องประชุม</h3>
                            </div>
                        </div>

                        <div className="ml-9 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-xl font-bold text-gray-800">{booking.room.name}</p>
                                <span className="bg-cyan-800 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {booking.room.capacity} คน
                                </span>
                            </div>
                            {booking.room.description && (
                                <p className="text-sm text-gray-600">{booking.room.description}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-100">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-amber-600 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">วันที่</span>
                            </div>
                            <p className="ml-10 text-lg font-medium text-gray-800">{formatDate(booking.bookingDate)}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-emerald-600 p-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-500">เวลา</span>
                            </div>
                            <p className="ml-10 text-lg font-medium text-gray-800">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                <span className="ml-2 text-sm text-gray-500">({getDurationInHours()} ชม.)</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-purple-600 p-2 rounded-lg">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-sm font-medium text-purple-600 uppercase tracking-wider">ข้อมูลผู้จอง</h3>
                        </div>

                        <div className="ml-9 space-y-3 bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg text-gray-800">{booking.user.name}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {booking.user.position && (
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 truncate">{booking.user.position}</p>
                                    </div>
                                )}

                                {booking.user.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <p className="text-sm text-gray-600">{booking.user.phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <div className="flex gap-3">
                        {userRole === '"admin"' && (
                            <button
                                type="button"
                                onClick={() => handleDelete(booking.id)}
                                className="px-5 py-2.5 flex items-center bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors font-medium"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                ยกเลิกการจอง
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900 transition-colors font-medium"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
