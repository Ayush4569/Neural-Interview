import { ReactNode, createContext, useContext, useState } from "react";

type Status = 'authenticated' | 'unauthenticated' | 'loading';
type User = {
    id: string;
    email: string;
    username: string;
    avatarUrl: string;
}
type AuthContextType = {
    status: Status;
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    setLoading: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [status, setStatus] = useState<Status>('unauthenticated');
    const login = (user: User) => {
        setUser(user);
        setStatus('authenticated');
    }
    const logout = () => {
        setUser(null);
        setStatus('unauthenticated');
    }
    const setLoading = () => setStatus('loading');
    return (
        <AuthContext.Provider value={
            { user, status, login, logout, setLoading }
        }>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthContextProvider')
    }
    return context;
}