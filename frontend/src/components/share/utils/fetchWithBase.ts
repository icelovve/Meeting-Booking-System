export const fetchWithBase = (url: string, options?: RequestInit) => {
    const base = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    return fetch(`${base}${url}`, options);
};
