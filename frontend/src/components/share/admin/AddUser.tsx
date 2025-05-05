"use client";

import { useState } from "react";
import { X, User, CreditCard, Phone, Briefcase, UserCheck, UserPlus, Loader2 } from "lucide-react";
import { fetchWithBase } from "../utils/fetchWithBase";
import Swal from "sweetalert2";

interface AddUserProps {
    onClose: () => void;
    fetchUser: () => Promise<void>;
}

export default function AddUser({ onClose, fetchUser }: AddUserProps) {
    const [name, setName] = useState<string>('');
    const [idNumber, setIdNumber] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [position, setPosition] = useState<string>('');
    const [role, setRole] = useState<string>('user');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = "กรุณากรอกชื่อผู้ใช้";
        }

        if (!idNumber.trim()) {
            newErrors.idNumber = "กรุณากรอกเลขบัตรประชาชน";
        } else if (idNumber.trim().length !== 13 || !/^\d+$/.test(idNumber)) {
            newErrors.idNumber = "กรุณากรอกเลขบัตรประชาชน 13 หลัก";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: Record<string, string> = {};

        if (!phone.trim()) {
            newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
        } else if (!/^\d{9,10}$/.test(phone.replace(/\s/g, ''))) {
            newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง";
        }

        if (!position.trim()) {
            newErrors.position = "กรุณากรอกตำแหน่ง";
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

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const userData = {
            name,
            id_number: idNumber,
            phone,
            position,
            role
        };

        try {
            const res = await fetchWithBase('/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (res.ok) {
                const data = await res.json();
                console.log('User added successfully:', data);
                Swal.fire({
                    icon: 'success',
                    text: 'เพิ่มผู้ใช้งานใหม่สำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    onClose();
                    fetchUser();
                });
            } else {
                console.error('Failed to add user');
                Swal.fire({
                    icon: 'error',
                    text: 'ไม่สามารถเพิ่มผู้ใช้งานใหม่ได้',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์',
                showConfirmButton: false,
                timer: 1500
            });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <UserPlus size={28} className="mr-3" />
                        <h2 className="text-xl font-bold">เพิ่มผู้ใช้งานใหม่</h2>
                    </div>

                    <p className="mt-1 text-white text-sm">กรอกข้อมูลผู้ใช้งานให้ครบถ้วนเพื่อเพิ่มข้อมูล</p>
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
                        <span>ข้อมูลพื้นฐาน</span>
                        <span>ข้อมูลติดต่อและสิทธิ์</span>
                    </div>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <User size={16} className="mr-2 text-cyan-700" />
                                    ชื่อผู้ใช้
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`block w-full border ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                    placeholder="กรอกชื่อ-นามสกุล"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <CreditCard size={16} className="mr-2 text-cyan-700" />
                                    เลขบัตรประชาชน
                                </label>
                                <input
                                    type="text"
                                    value={idNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 13) {
                                            setIdNumber(value);
                                        }
                                    }}
                                    className={`block w-full border ${errors.idNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                    placeholder="กรอกเลขบัตรประชาชน 13 หลัก"
                                    maxLength={13}
                                />
                                {errors.idNumber && <p className="mt-1 text-sm text-red-600">{errors.idNumber}</p>}
                            </div>

                            <div className="p-4 bg-cyan-50 border border-cyan-100 rounded-lg mt-6">
                                <p className="text-sm text-cyan-800">
                                    <strong>หมายเหตุ:</strong> ข้อมูลทั้งหมดจะถูกเก็บเป็นความลับตามนโยบายความปลอดภัย
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Phone size={16} className="mr-2 text-cyan-700" />
                                    เบอร์โทรศัพท์
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) {
                                            setPhone(value);
                                        }
                                    }}
                                    className={`block w-full border ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                    placeholder="กรอกเบอร์โทรศัพท์"
                                    maxLength={10}
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Briefcase size={16} className="mr-2 text-cyan-700" />
                                    ตำแหน่ง
                                </label>
                                <input
                                    type="text"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    className={`block w-full border ${errors.position ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500`}
                                    placeholder="กรอกตำแหน่งงาน"
                                />
                                {errors.position && <p className="mt-1 text-sm text-red-600">{errors.position}</p>}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <UserCheck size={16} className="mr-2 text-cyan-700" />
                                    สิทธิ์การใช้งาน
                                </label>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    <div
                                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${role === 'user'
                                            ? 'bg-cyan-50 border-cyan-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setRole('user')}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-2 border ${role === 'user' ? 'border-cyan-600' : 'border-gray-400'
                                                }`}>
                                                {role === 'user' && <div className="w-2 h-2 rounded-full bg-cyan-600 m-0.5"></div>}
                                            </div>
                                            <span className="font-medium">ผู้ใช้งาน</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">สามารถใช้งานระบบทั่วไปได้</p>
                                    </div>

                                    <div
                                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${role === 'admin'
                                            ? 'bg-cyan-50 border-cyan-300'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        onClick={() => setRole('admin')}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-2 border ${role === 'admin' ? 'border-cyan-600' : 'border-gray-400'
                                                }`}>
                                                {role === 'admin' && <div className="w-2 h-2 rounded-full bg-cyan-600 m-0.5"></div>}
                                            </div>
                                            <span className="font-medium">ผู้ดูแลระบบ</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">สามารถจัดการข้อมูลทั้งหมดได้</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

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
                            'บันทึก'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}