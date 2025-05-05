"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import {
    Calendar,
    LogOut,
    Menu,
    User,
    X,
} from "lucide-react";
import { fetchWithBase } from "../share/utils/fetchWithBase";

interface User {
    id: number;
    id_number: string;
    phone: string;
    role: string;
    name: string;
}

interface DecodedToken {
    id: number;
    id_number: string;
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tokenInfo, setTokenInfo] = useState<DecodedToken | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('access_token');
        if (storedToken) {
            document.cookie = `access_token=${storedToken}; path=/;`;
            setToken(storedToken);

            const storedUserData = localStorage.getItem('user_data');
            if (storedUserData) {
                try {
                    setUser(JSON.parse(storedUserData));
                } catch (error) {
                    console.error('Failed to parse stored user data:', error);
                }
            }
        } else {
            router.push('/');
        }

        const handleResize = () => {
            setIsSidebarOpen(window.innerWidth >= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [router]);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setTokenInfo(decoded);
            } catch (error) {
                console.error('Failed to decode token:', error);
                handleLogout();
            }
        }
    }, [token]);

    useEffect(() => {
        const fetchUser = async () => {
            if (tokenInfo?.id && !user) {
                try {
                    const res = await fetchWithBase(`/user/${tokenInfo.id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setUser(data.user);
                        localStorage.setItem('user_id', JSON.stringify(data.user.id));
                        localStorage.setItem('role', JSON.stringify(data.user.role))
                    } else {
                        console.error('Failed to fetch user data');
                        handleLogout();
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
        };

        fetchUser();
    }, [tokenInfo, user]);

    const handleLogout = () => {
        Swal.fire({
            icon: "success",
            text: "กำลังออกจากระบบ",
            showConfirmButton: false,
            timer: 1500,
        }).then(() => {
            localStorage.clear();
            document.cookie =
                "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie =
                "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            router.push("/");
        });
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        { label: "ปฏิทิน", href: "/bookings", icon: Calendar },
        { label: "โปรไฟล์", href: "/profile", icon: User },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:static md:w-64`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-cyan-800">
                    <h2 className="text-xl font-bold text-white">ระบบจองห้องประชุม</h2>
                    <button
                        className="md:hidden text-white hover:text-gray-200 focus:outline-none"
                        onClick={toggleSidebar}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-full bg-cyan-800 flex items-center justify-center text-white shadow-md">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name || "ผู้ใช้"}</p>
                            <p className="text-gray-500 text-xs truncate">{user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</p>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {menuItems.map(({ label, href, icon: Icon }) => (
                            <a
                                key={href}
                                href={href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-cyan-800 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </a>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-700 hover:text-white transition-all duration-200 ease-in-out"
                        >
                            <LogOut className="h-5 w-5" />
                            ออกจากระบบ
                        </button>
                    </nav>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <button
                    className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-full bg-cyan-800 text-white hover:bg-cyan-700 focus:outline-none shadow-lg transition-colors duration-200"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-6 w-6" />
                </button>

                <main className="flex-1 overflow-y-auto p-2 md:p-4">
                    <div className="min-h-screen">
                        {children}
                    </div>
                </main>
            </div>

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 bg-opacity-60 z-20 md:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
}