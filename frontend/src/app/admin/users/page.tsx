"use client";

import AdminLayout from "@/components/layouts/AdminLayout";
import { fetchWithBase } from "@/components/share/utils/fetchWithBase";
import { Plus, Trash2, Users, Search, ChevronDown, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import AddUser from "@/components/share/admin/AddUser";
import Swal from "sweetalert2";

interface User {
   id: number;
   name: string;
   id_number: string;
   phone: string;
   role: string;
   position: string;
   createAt: number;
   updateAt: string;
}

export default function Page() {
   const [users, setUsers] = useState<User[]>([]);
   const [isPopUpOpen, setIsPopUpOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterRole, setFilterRole] = useState("all");

   const fetchUser = async () => {
      setIsLoading(true);
      try {
         const res = await fetchWithBase('/user')
         if (res.ok) {
            const data = await res.json()
            setUsers(data.users)
         } else {
            Swal.fire({
               icon: 'error',
               text: 'ไม่สามารถดึงข้อมูลผู้ใช้งานได้',
               showConfirmButton: false,
               timer: 1500
            });
         }
      } catch (error) {
         console.error('Error fetching users:', error)
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchUser();
   }, []);

   const handleAddUser = () => {
      setIsPopUpOpen(true)
   }

   const handleDeleteUser = async (userId: number) => {
      const result = await Swal.fire({
         text: 'ต้องการลบผู้ใช้งานรายนี้หรือไม่',
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#899499",
         confirmButtonText: "ยืนยัน",
         cancelButtonText: "ยกเลิก"

      });

      if (result.isConfirmed) {
         const res = await fetchWithBase(`/user/${userId}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            },
         });

         if (res.ok) {
            Swal.fire({
               icon: "success",
               text: 'ลบผู้ใช้งานเรียบร้อยแล้ว',
               showConfirmButton: false,
               timer: 1500
            }).then(() => {
               fetchUser();
            });
         } else {
            Swal.fire({
               icon: "error",
               text: 'ไม่สามารถลบผู้ใช้งานได้',
               showConfirmButton: false,
               timer: 1500
            });
         }
      }
   };

   const getRoleBadgeClasses = (role: string) => {
      switch (role) {
         case 'admin':
            return 'bg-blue-100 text-blue-800 border border-blue-200';
         case 'user':
            return 'bg-green-100 text-green-800 border border-green-200';
         default:
            return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
   }

   const filteredUsers = users
      .filter(user =>
         user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.id_number.includes(searchTerm) ||
         user.phone.includes(searchTerm) ||
         user.position.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(user => filterRole === "all" || user.role === filterRole);

   return (
      <AdminLayout>
         <div className="bg-cyan-900 text-white rounded-lg p-6 shadow-md">
            <div className="max-w-7xl mx-auto">
               <h1 className="text-2xl font-bold flex items-center">
                  <Users className="h-7 w-7 mr-3" />
                  จัดการผู้ใช้งาน
               </h1>
               <p className="mt-2 text-white">จัดการผู้ใช้งานในระบบ เพิ่มและลบข้อมูล</p>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
               <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                           type="text"
                           className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-cyan-700 focus:border-cyan-700 text-sm"
                           placeholder="ค้นหาผู้ใช้งาน..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                     <div className="relative">
                        <div className="flex">
                           <button
                              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 text-sm font-medium flex items-center hover:bg-gray-200"
                           >
                              <Filter size={18} className="mr-2" />
                              <span>
                                 {filterRole === "all" ? "ทั้งหมด" :
                                    filterRole === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                              </span>
                              <ChevronDown size={16} className="ml-2" />
                           </button>

                           <div className="absolute right-0 mt-11 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 hidden group-hover:block">
                              <div className="py-1">
                                 <button
                                    onClick={() => setFilterRole("all")}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                 >
                                    ทั้งหมด
                                 </button>
                                 <button
                                    onClick={() => setFilterRole("admin")}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                 >
                                    ผู้ดูแลระบบ
                                 </button>
                                 <button
                                    onClick={() => setFilterRole("user")}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                 >
                                    ผู้ใช้งาน
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>

                     <button
                        onClick={handleAddUser}
                        className="px-5 py-2.5 bg-cyan-800 hover:bg-cyan-900 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 flex items-center justify-center text-sm"
                     >
                        <Plus size={18} className="mr-2" />
                        เพิ่มผู้ใช้งานใหม่
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
               {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {[1, 2, 3].map((item) => (
                        <div key={item} className="animate-pulse border rounded-lg p-4">
                           <div className="flex items-center space-x-4">
                              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                              <div className="flex-1 space-y-2">
                                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                 <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                              </div>
                           </div>
                           <div className="mt-4 space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-full"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-16">
                     <Users className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                     <h3 className="text-xl font-semibold text-gray-700 mb-2">ไม่พบผู้ใช้งาน</h3>
                     <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm
                           ? `ไม่พบผู้ใช้งานที่ตรงกับ "${searchTerm}" กรุณาลองค้นหาด้วยคำอื่น`
                           : "ยังไม่มีรายการผู้ใช้งานในระบบ คลิกปุ่ม 'เพิ่มผู้ใช้งานใหม่' เพื่อเริ่มต้น"}
                     </p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredUsers.map((user) => (
                        <div key={user.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start">
                              <div className="flex items-center space-x-3">
                                 <div className="flex-shrink-0 h-12 w-12 rounded-full bg-cyan-800 text-white flex items-center justify-center text-lg font-semibold">
                                    {user.name.charAt(0)}
                                 </div>
                                 <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.position}</p>
                                 </div>
                              </div>

                              <div className="relative group">
                                 <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="flex items-center px-4 py-2 text-sm text-red-600 w-full text-left"
                                 >
                                    <Trash2 size={16} className="hover:text-gray-500" />
                                 </button>
                              </div>
                           </div>

                           <div className="mt-4 space-y-2 text-sm">
                              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                 <span className="text-gray-500">เลขบัตรประชาชน</span>
                                 <span className="font-medium">{user.id_number}</span>
                              </div>

                              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                 <span className="text-gray-500">หมายเลขโทรศัพท์</span>
                                 <span className="font-medium">{user.phone}</span>
                              </div>

                              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                 <span className="text-gray-500">สิทธิ์การเข้าถึง</span>
                                 <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClasses(user.role)}`}>
                                    {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                                 </span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {isPopUpOpen && (
               <AddUser
                  onClose={() => setIsPopUpOpen(false)}
                  fetchUser={fetchUser}
               />
            )}
         </div>
      </AdminLayout>
   );
}