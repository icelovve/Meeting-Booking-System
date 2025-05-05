"use client";

import { fetchWithBase } from '@/components/share/utils/fetchWithBase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, Phone, Calendar, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';
import Image from 'next/image';

const LoginPage = () => {
   const [idNumber, setIdNumber] = useState('');
   const [phoneNumber, setPhoneNumber] = useState('');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
         const response = await fetchWithBase(`/auth/login`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id_number: idNumber, phone: phoneNumber }),
         });

         if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('role', data.role);

            Swal.fire({
               icon: "success",
               text: "ยินดีต้อนรับเข้าสู่ระบบ",
               showConfirmButton: false,
               timer: 1500
            }).then(() => {
               if (data.role === 'admin') {
                  router.push('/admin/');
               } else {
                  router.push('/bookings/');
               }
            });
         } else {
            const errorData = await response.json();
            setError(errorData.message || 'ไม่สามารถเข้าสู่ระบบได้');
            Swal.fire({
               icon: "error",
               text: 'ไม่สามารถเข้าสู่ระบบได้',
               showConfirmButton: false,
               timer: 1500
            });
         }
      } catch (err) {
         setError('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
         console.log('Error:', err);
      } finally {
         setIsLoading(false);
      }
   };

   const handleToAdmin = () => {
      Swal.fire({
         icon: "error",
         text: 'ฟังก์ชันนี้ยังไม่เปิดให้บริการ',
         showConfirmButton: false,
         timer: 3000
      });
   }

   const year = new Date().getFullYear();

   return (
      <div className="min-h-screen flex bg-zinc-100">
         <div className="w-0 md:w-1/2 bg-gradient-to-br from-cyan-950 to-cyan-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30 z-10"></div>

            <div className="relative z-20 h-full flex flex-col p-10 justify-between">
               <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                     <div className="rounded-full bg-white/10 backdrop-blur-sm p-2">
                        <Calendar className="h-6 w-6 text-cyan-100" />
                     </div>
                     <h1 className="text-3xl font-bold tracking-tight">MeetingRoom</h1>
                  </div>
                  <p className="text-cyan-200 text-lg ml-1">ระบบจองห้องประชุมออนไลน์</p>
               </div>

               <div className="py-8 flex-grow flex items-center justify-center">
                  <div className="relative">
                     <div className="relative rounded-2xl overflow-hidden">
                        <Image
                           src='/meeting.png'
                           alt="Meeting Room"
                           width={550}
                           height={550}
                           className="object-cover"
                        />
                     </div>
                  </div>
               </div>

               <div className="text-sm text-cyan-200/70 flex items-center space-x-6">
                  <span>© {year} MeetingRoom</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/50"></span>
                  <span>V 1.0</span>
               </div>
            </div>

            <div className="absolute inset-0 bg-[url('/subtle-pattern.png')] opacity-5 mix-blend-overlay"></div>
         </div>

         <div className="w-full md:w-1/2 flex items-center justify-center p-6">
            <div className="w-full max-w-md p-8 rounded-2xl">
               <div className="mb-8">
                  <h2 className="text-3xl font-semibold text-gray-800 tracking-tight">เข้าสู่ระบบ</h2>
                  <p className="text-gray-500 mt-2">เข้าสู่ระบบเพื่อจองห้องประชุม</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                     <div>
                        <label htmlFor="id-number" className="block text-sm font-medium text-gray-700 mb-1.5">
                           เลขประจำตัว
                        </label>
                        <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-600 transition-colors">
                              <User className="h-5 w-5" />
                           </div>
                           <input
                              id="id-number"
                              name="id_number"
                              type="text"
                              required
                              value={idNumber}
                              onChange={(e) => setIdNumber(e.target.value)}
                              className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-900 transition-all"
                              placeholder="กรอกเลขประจำตัว"
                           />
                        </div>
                     </div>

                     <div>
                        <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1.5">
                           เบอร์โทรศัพท์
                        </label>
                        <div className="relative group">
                           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-cyan-600 transition-colors">
                              <Phone className="h-5 w-5" />
                           </div>
                           <input
                              id="phone-number"
                              name="phone"
                              type="text"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-900 transition-all"
                              placeholder="กรอกเบอร์โทรศัพท์"
                           />
                        </div>
                     </div>
                  </div>

                  {error && (
                     <div className="py-3 px-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                        {error}
                     </div>
                  )}

                  <button
                     type="submit"
                     disabled={isLoading}
                     className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow-md text-base font-medium text-white bg-cyan-900 hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors disabled:opacity-50"
                  >
                     {isLoading ? (
                        <span className="flex items-center">
                           <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           กำลังดำเนินการ...
                        </span>
                     ) : (
                        <>
                           เข้าสู่ระบบ
                           <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                     )}
                  </button>
               </form>

               <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                     มีปัญหาในการเข้าสู่ระบบ? <a onClick={handleToAdmin} className="font-medium text-cyan-800 hover:text-cyan-600 transition-colors">ติดต่อผู้ดูแลระบบ</a>
                  </p>
               </div>
            </div>
         </div>
      </div >
   );
};

export default LoginPage;