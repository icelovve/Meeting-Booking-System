"use client";

import { useState, useEffect } from "react";
import { fetchWithBase } from "../share/utils/fetchWithBase";
import { jwtDecode } from "jwt-decode";
import {
    Calendar,
    Users,
    LogOut,
    BookOpen,
    Home,
    Menu,
    X,
    User,
} from "lucide-react";
import Swal from 'sweetalert2';
import { useRouter, usePathname } from "next/navigation";

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [tokenInfo, setTokenInfo] = useState<DecodedToken | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

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
            timer: 1500
        }).then(() => {
            localStorage.clear();
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            router.push('/');
        });
    };

    const navItems = [
        { name: 'แดชบอร์ด', icon: <Home size={18} />, path: '/admin' },
        { name: 'ดูและจัดการการจองห้องประชุม', icon: <Calendar size={18} />, path: '/admin/bookings' },
        { name: 'จัดการห้องประชุม', icon: <BookOpen size={18} />, path: '/admin/rooms' },
        { name: 'จัดการผู้ใช้', icon: <Users size={18} />, path: '/admin/users' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 bg-opacity-60 z-20 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-4 left-4 z-30 p-2 rounded-full bg-white shadow-md text-cyan-900 md:hidden"
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <aside
                className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-5 bg-cyan-900 text-white">
                        <h2 className="text-lg font-medium">ระบบจองห้องประชุม</h2>
                        <p className="text-xs opacity-80 mt-1">โหมดผู้ดูแลระบบ</p>
                    </div>

                    {user && (
                        <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-full bg-cyan-800 text-cyan-900 flex items-center justify-center">
                                <User size={18} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                                <p className="text-gray-500 text-xs truncate">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}</p>
                            </div>
                        </div>
                    )}

                    <nav className="flex-1 py-1 overflow-y-auto">
                        <ul className="px-3 space-y-1">
                            {navItems.map((item, index) => {
                                const isActive = pathname === item.path;
                                return (
                                    <li key={index}>
                                        <button
                                            onClick={() => {
                                                router.push(item.path);
                                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive
                                                ? 'bg-cyan-800 text-white font-medium'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <span className={`mr-3 ${isActive ? 'text-white' : 'text-cyan-900'}`}>
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2.5 text-sm text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={18} className="mr-3 text-gray-400" />
                            <span>ออกจากระบบ</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-6 max-w-8xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}