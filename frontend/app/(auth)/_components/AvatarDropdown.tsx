import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { User, LogOut } from "lucide-react"
import Link from "next/link"

export function AvatarDropDown({ children }: { children: React.ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="group relative cursor-pointer rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-indigo-400 focus:outline-none" asChild>
                <div className="overflow-hidden rounded-full">
                    {children}
                </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                className="w-56 border-[color:var(--border)] shadow-lg backdrop-blur-sm" 
                style={{ background: 'var(--surface)' }}
                align="end"
                sideOffset={8}
            >
                <DropdownMenuLabel className="text-[color:var(--text)] font-semibold">
                    My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[color:var(--border)]" />
                
                <DropdownMenuItem className="group cursor-pointer transition-all duration-200 hover:bg-indigo-500/10 focus:bg-indigo-500/10" asChild>
                    <Link href="/profile" className="flex items-center gap-2 px-2 py-2 text-[color:var(--text)] hover:text-white">
                        <User className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-[color:var(--border)]" />
                
                <DropdownMenuItem className="p-1">
                    <Button 
                        className="w-full justify-start gap-2 bg-red-600/10 text-red-300 hover:bg-red-600/20 hover:text-red-300 border border-red-700/20 hover:border-red-700/40 transition-all duration-200 group"
                        variant="ghost"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                        Logout
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
