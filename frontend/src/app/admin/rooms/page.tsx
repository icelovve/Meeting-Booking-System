"use client";

import AdminLayout from "@/components/layouts/AdminLayout";
import { fetchWithBase } from "@/components/share/utils/fetchWithBase";
import { Projector, Plus, Users, Edit, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface Room {
   id?: string;
   name: string;
   description: string;
   capacity: number;
}

export default function Page() {
   const [rooms, setRooms] = useState<Room[]>([]);
   const [roomName, setRoomName] = useState<string>("");
   const [roomDescription, setRoomDescription] = useState<string>("");
   const [roomCapacity, setRoomCapacity] = useState<number>(0);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [editingRoom, setEditingRoom] = useState<Room | null>(null);

   const fetchRooms = async () => {
      setIsLoading(true);
      try {
         const res = await fetchWithBase("/room");
         if (res.ok) {
            const data = await res.json();
            setRooms(data.room);
         } else {
            Swal.fire({
               icon: "error",
               text: "ไม่สามารถดึงข้อมูลห้องประชุมได้",
               showConfirmButton: false,
               timer: 1500,
            });
         }
      } catch (error) {
         console.error("Error fetching rooms:", error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchRooms();
   }, []);

   const resetForm = () => {
      setRoomName("");
      setRoomDescription("");
      setRoomCapacity(0);
      setEditingRoom(null);
   };

   const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!roomName.trim()) {
         Swal.fire({
            icon: "warning",
            text: "กรุณาระบุชื่อห้องประชุม",
            showConfirmButton: false,
            timer: 1500,
         });
         return;
      }

      if (roomCapacity <= 0) {
         Swal.fire({
            icon: "warning",
            text: "ความจุห้องประชุมต้องมากกว่า 0",
            showConfirmButton: false,
            timer: 1500,
         });
         return;
      }

      const roomData: Room = {
         name: roomName,
         description: roomDescription,
         capacity: roomCapacity,
      };

      setIsLoading(true);

      try {
         let res;

         if (editingRoom) {
            res = await fetchWithBase(`/room/${editingRoom.id}`, {
               method: "PATCH",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(roomData),
            });
         } else {
            res = await fetchWithBase("/room", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(roomData),
            });
         }

         if (res.ok) {
            Swal.fire({
               icon: "success",
               text: editingRoom ? "แก้ไขห้องประชุมสำเร็จ" : "เพิ่มห้องประชุมสำเร็จ",
               showConfirmButton: false,
               timer: 1500,
            });
            resetForm();
            fetchRooms();
         } else {
            Swal.fire({
               icon: "error",
               text: editingRoom
                  ? "ไม่สามารถแก้ไขห้องประชุมได้"
                  : "ไม่สามารถเพิ่มห้องประชุมใหม่ได้",
               showConfirmButton: false,
               timer: 1500,
            });
         }
      } catch (error) {
         console.error("Error saving room:", error);
         Swal.fire({
            icon: "error",
            text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
            showConfirmButton: false,
            timer: 1500,
         });
      } finally {
         setIsLoading(false);
      }
   };

   const handleEdit = (room: Room) => {
      setEditingRoom(room);
      setRoomName(room.name);
      setRoomDescription(room.description);
      setRoomCapacity(room.capacity);

      window.scrollTo({
         top: 0,
         behavior: "smooth",
      });
   };

   const handleDelete = async (roomId: string) => {
      Swal.fire({
         text: "คุณต้องการลบห้องประชุมใช่หรือไม่?",
         icon: "warning",
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#414141",
         confirmButtonText: "ยืนยัน",
         cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
         if (result.isConfirmed) {
            try {
               const res = await fetchWithBase(`/room/${roomId}`, {
                  method: "DELETE",
               });

               if (res.ok) {
                  Swal.fire({
                     icon: "success",
                     text: "ลบห้องประชุมสำเร็จ",
                     showConfirmButton: false,
                     timer: 1500,
                  });
                  fetchRooms();
               } else {
                  Swal.fire({
                     icon: "error",
                     text: "ไม่สามารถลบห้องประชุมได้",
                     showConfirmButton: false,
                     timer: 1500,
                  });
               }
            } catch (error) {
               console.error("Error deleting room:", error);
               Swal.fire({
                  icon: "error",
                  text: "เกิดข้อผิดพลาดในการลบข้อมูล",
                  showConfirmButton: false,
                  timer: 1500,
               });
            }
         }
      });
   };

   return (
      <AdminLayout>
         <div className="p-8 max-w-full bg-gray-50 min-h-screen">
            <div className="flex items-center mb-8">
               <Projector className="h-7 w-7 text-cyan-800 mr-3" />
               <h1 className="text-2xl font-black text-cyan-800">
                  จัดการห้องประชุม
               </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-cyan-800 mb-6 flex items-center">
                     {editingRoom ? (
                        <>
                           <Edit className="h-5 w-5 text-amber-600 mr-2" />
                           แก้ไขห้องประชุม
                        </>
                     ) : (
                        <>
                           <Plus className="h-5 w-5 text-cyan-800 mr-2" />
                           เพิ่มห้องประชุมใหม่
                        </>
                     )}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                     <div>
                        <label
                           htmlFor="name"
                           className="block text-sm font-medium text-gray-600 mb-1"
                        >
                           ชื่อห้องประชุม
                        </label>
                        <input
                           type="text"
                           id="name"
                           name="name"
                           value={roomName}
                           onChange={(e) => setRoomName(e.target.value)}
                           required
                           className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-800 transition-all outline-none"
                           placeholder="กรอกชื่อห้องประชุม"
                        />
                     </div>

                     <div>
                        <label
                           htmlFor="description"
                           className="block text-sm font-medium text-gray-600 mb-1"
                        >
                           รายละเอียด
                        </label>
                        <textarea
                           id="description"
                           name="description"
                           rows={3}
                           value={roomDescription}
                           onChange={(e) => setRoomDescription(e.target.value)}
                           required
                           className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-800 transition-all outline-none resize-none"
                           placeholder="รายละเอียดเกี่ยวกับห้องประชุม"
                        ></textarea>
                     </div>

                     <div>
                        <label
                           htmlFor="capacity"
                           className="block text-sm font-medium text-gray-600 mb-1"
                        >
                           <span className="flex items-center">
                              <Users className="h-4 w-4 text-gray-500 mr-1" />
                              ความจุ (คน)
                           </span>
                        </label>
                        <input
                           type="number"
                           id="capacity"
                           name="capacity"
                           value={roomCapacity}
                           onChange={(e) => setRoomCapacity(Number(e.target.value))}
                           required
                           min="1"
                           className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-100 focus:border-cyan-800 transition-all outline-none"
                           placeholder="จำนวนคนที่รองรับได้"
                        />
                     </div>

                     <div className="flex space-x-3 pt-2">
                        <button
                           type="submit"
                           disabled={isLoading}
                           className={`flex-1 px-6 py-3 ${editingRoom
                              ? "bg-amber-600 hover:bg-amber-700"
                              : "bg-cyan-800 hover:bg-cyan-900"
                              } text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-70`}
                        >
                           {isLoading
                              ? "กำลังบันทึก..."
                              : editingRoom
                                 ? "บันทึกการแก้ไข"
                                 : "บันทึกข้อมูล"}
                        </button>

                        {editingRoom && (
                           <button
                              type="button"
                              onClick={resetForm}
                              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                           >
                              ยกเลิก
                           </button>
                        )}
                     </div>
                  </form>
               </div>

               <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-cyan-800 mb-6 flex items-center">
                     <Projector className="h-5 w-5 text-cyan-800 mr-2" />
                     รายการห้องประชุม
                  </h2>

                  {isLoading && !rooms.length ? (
                     <div className="text-center py-12 text-gray-500">
                        <div className="animate-pulse flex flex-col items-center">
                           <div className="h-12 w-12 bg-gray-200 rounded-full mb-3"></div>
                           <div className="h-4 bg-gray-200 rounded w-24 mb-2.5"></div>
                           <div className="h-3 bg-gray-200 rounded w-36"></div>
                        </div>
                     </div>
                  ) : rooms.length === 0 ? (
                     <div className="text-center py-12 text-gray-500">
                        <Projector className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p>ยังไม่มีรายการห้องประชุม</p>
                        <p className="text-sm mt-1">
                           เพิ่มห้องประชุมใหม่เพื่อแสดงที่นี่
                        </p>
                     </div>
                  ) : (
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ชื่อห้องประชุม
                                 </th>
                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    รายละเอียด
                                 </th>
                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ความจุ
                                 </th>
                                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    จัดการ
                                 </th>
                              </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-gray-200">
                              {rooms.map((room, index) => (
                                 <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                 >
                                    <td className="px-6 py-4 text-sm text-center font-medium text-gray-800">
                                       {room.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                       <div className="truncate" title={room.description}>
                                          {room.description}
                                       </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-600">
                                       <span className="flex items-center justify-center">
                                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                                          {room.capacity} คน
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                       <div className="flex justify-center space-x-3">
                                          <button
                                             onClick={() => handleEdit(room)}
                                             className="text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                             title="แก้ไข"
                                          >
                                             <Edit className="h-4 w-4" />
                                          </button>
                                          <button
                                             onClick={() => room.id && handleDelete(room.id)}
                                             className="text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                             title="ลบ"
                                          >
                                             <Trash2 className="h-4 w-4" />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </AdminLayout>
   );
}
