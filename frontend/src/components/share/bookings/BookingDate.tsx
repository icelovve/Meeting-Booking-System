"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Building, Loader2, Check } from "lucide-react";
import { fetchWithBase } from "../utils/fetchWithBase";

interface BookingDateProps {
    onClose: () => void;
    fetchBookings: () => Promise<void>;
}

interface Bookings {
    id: number;
    userId: number;
    roomId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
}

interface Room {
    id: number;
    name: string;
    description: string;
    capacity: number;
    createAt: Date;
    updateAt: Date;
}

export default function BookingDate({ onClose, fetchBookings }: BookingDateProps) {
    const [bookings, setBookings] = useState<Bookings[]>([])
    const [userId, setUserId] = useState<number>(0);
    const [room, setRoom] = useState<Room[]>([]);
    const [roomId, setRoomId] = useState<number>(0);
    const [bookingDate, setBookingDate] = useState<string>("");
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<number>(1);
    const [conflictDetails, setConflictDetails] = useState<string>("");

    const fetchBooking = async () => {
        try {
            const res = await fetchWithBase("/bookings")
            if (!res.ok) {
                throw new Error("Failed to fetch bookings");
            }
            const data = await res.json();
            setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    }

    useEffect(() => {
        fetchBooking();
    }, [])

    const fetchRoom = async () => {
        try {
            const res = await fetchWithBase("/room");
            if (res.ok) {
                const data = await res.json();
                setRoom(data.room);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    useEffect(() => {
        fetchRoom();
    }, []);

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            console.error("User ID not found in local storage.");
        }
    }, []);

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!roomId) {
            newErrors.roomId = "กรุณาเลือกห้องประชุม";
        }

        if (!bookingDate) {
            newErrors.bookingDate = "กรุณาเลือกวันที่";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!startTime) {
            newErrors.startTime = "กรุณาเลือกเวลาเริ่มต้น";
        }

        if (!endTime) {
            newErrors.endTime = "กรุณาเลือกเวลาสิ้นสุด";
        } else if (startTime >= endTime) {
            newErrors.endTime = "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            handleSubmit();
        }
    };

    const prevStep = () => {
        setStep(1);
    };

    const checkTimeOverlap = (newStart: string, newEnd: string, existingStart: string, existingEnd: string): boolean => {
        return (
            (newStart < existingEnd && newEnd > existingStart) ||
            (newStart === existingStart && newEnd === existingEnd)
        );
    };

    const formatTime = (time: string): string => {
        return `${time} น.`;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});
        setConflictDetails("");

        const conflictBookings = bookings.filter((existingBooking) => {
            return (
                existingBooking.roomId === roomId &&
                existingBooking.bookingDate === bookingDate &&
                checkTimeOverlap(startTime, endTime, existingBooking.startTime, existingBooking.endTime)
            );
        });

        if (conflictBookings.length > 0) {
            const conflictingTime = conflictBookings.map(booking =>
                `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
            ).join(", ");

            setConflictDetails(conflictingTime);
            setErrors({
                submit: "ไม่สามารถจองได้เนื่องจากมีการจองในช่วงเวลาที่ซ้อนทับกัน"
            });
            setIsSubmitting(false);
            return;
        }


        try {
            const res = await fetchWithBase("/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    roomId,
                    bookingDate,
                    startTime,
                    endTime,
                }),
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setRoomId(0);
                setBookingDate("");
                setStartTime("");
                setEndTime("");

                await fetchBookings();

                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                const errorData = await res.json();
                setErrors({ submit: errorData.message || "เกิดข้อผิดพลาดในการจองห้องประชุม" });
            }
        } catch (error) {
            console.error("Error booking room:", error);
            setErrors({ submit: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const timeOptions = [];
    for (let hour = 8; hour < 18; hour++) {
        const formattedHour = hour.toString().padStart(2, "0");
        timeOptions.push(`${formattedHour}:00`);
        timeOptions.push(`${formattedHour}:15`);
        timeOptions.push(`${formattedHour}:30`);
        timeOptions.push(`${formattedHour}:45`);
    }
    timeOptions.push("18:00");

    const filteredEndTimeOptions = timeOptions.filter(time => time > startTime);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden">
                <div className="bg-cyan-900 text-white p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-cyan-100 focus:outline-none transition-colors"
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center">
                        <Calendar size={28} className="mr-3" />
                        <h2 className="text-xl font-bold">จองห้องประชุม</h2>
                    </div>

                    <p className="mt-1 text-white text-sm">กรอกข้อมูลการจองห้องประชุมให้ครบถ้วน</p>
                </div>

                <div className="px-8 pt-6">
                    <div className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm ${step >= 1 ? 'bg-cyan-700' : 'bg-gray-300'}`}>
                            1
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-cyan-700' : 'bg-gray-200'}`}></div>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-sm ${step >= 2 ? 'bg-cyan-700' : 'bg-gray-300'}`}>
                            2
                        </div>
                    </div>
                    <div className="flex justify-between mt-1 px-1 text-xs text-gray-500">
                        <span>เลือกห้องและวันที่</span>
                        <span>เลือกเวลาและยืนยัน</span>
                    </div>
                </div>

                <div className="p-8">
                    {submitSuccess ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-green-800">จองห้องประชุมสำเร็จ!</h3>
                            <p className="text-green-600 text-center">ระบบได้บันทึกการจองของคุณเรียบร้อยแล้ว</p>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Building size={16} className="mr-2 text-cyan-700" />
                                            ห้องประชุม
                                        </label>
                                        <select
                                            value={roomId}
                                            onChange={(e) => setRoomId(Number(e.target.value))}
                                            className={`block w-full border ${errors.roomId ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                        >
                                            <option value={0}>เลือกห้องประชุม</option>
                                            {room.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name} (ความจุ {r.capacity} คน)
                                                </option>
                                            ))}
                                        </select>
                                        {errors.roomId && <p className="mt-1 text-sm text-red-600">{errors.roomId}</p>}
                                    </div>

                                    <div>
                                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Calendar size={16} className="mr-2 text-cyan-700" />
                                            วันที่จอง
                                        </label>
                                        <input
                                            type="date"
                                            value={bookingDate}
                                            onChange={(e) => setBookingDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`block w-full border ${errors.bookingDate ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                        />
                                        {errors.bookingDate && <p className="mt-1 text-sm text-red-600">{errors.bookingDate}</p>}
                                    </div>

                                    {roomId > 0 && (
                                        <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg mt-6">
                                            <h3 className="font-medium text-cyan-800 mb-2">รายละเอียดห้อง</h3>
                                            {room.find(r => r.id === roomId) && (
                                                <p className="text-sm text-cyan-800">
                                                    {room.find(r => r.id === roomId)?.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <Clock size={16} className="mr-2 text-cyan-700" />
                                                เวลาเริ่มต้น
                                            </label>
                                            <select
                                                value={startTime}
                                                onChange={(e) => {
                                                    setStartTime(e.target.value);
                                                    if (e.target.value >= endTime) {
                                                        setEndTime("");
                                                    }
                                                }}
                                                className={`block w-full border ${errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                            >
                                                <option value="">เลือกเวลาเริ่มต้น</option>
                                                {timeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {time} น.
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                <Clock size={16} className="mr-2 text-cyan-700" />
                                                เวลาสิ้นสุด
                                            </label>
                                            <select
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                disabled={!startTime}
                                                className={`block w-full border ${errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 disabled:bg-gray-100 disabled:text-gray-400`}
                                            >
                                                <option value="">เลือกเวลาสิ้นสุด</option>
                                                {filteredEndTimeOptions.map((time) => (
                                                    <option key={time} value={time}>
                                                        {time} น.
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>}
                                        </div>
                                    </div>

                                    {roomId > 0 && bookingDate && startTime && endTime && (
                                        <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-4 mt-4">
                                            <h3 className="font-medium text-cyan-800 mb-2">สรุปการจอง</h3>
                                            <div className="text-sm text-cyan-800">
                                                <p>ห้อง {room.find(r => r.id === roomId)?.name} {new Date(bookingDate).toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} เวลา {startTime} - {endTime} น.</p>
                                            </div>
                                        </div>
                                    )}

                                    {errors.submit && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                            <p className="font-medium">{errors.submit}</p>
                                            {conflictDetails && (
                                                <div className="mt-2 text-sm">
                                                    <p>ช่วงเวลาที่มีการจองแล้ว : {conflictDetails}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!submitSuccess && (
                    <div className="bg-gray-50 px-8 py-5 flex justify-between">
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300"
                            >
                                ยกเลิก
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300"
                            >
                                ย้อนกลับ
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={isSubmitting}
                            className="px-5 py-2.5 bg-cyan-800 text-white rounded-lg hover:bg-cyan-900 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : step === 1 ? (
                                'ถัดไป'
                            ) : (
                                'ยืนยันการจอง'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}