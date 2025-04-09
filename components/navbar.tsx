"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/user-context"
import { logoutUser } from "@/services/db-service"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUser()

  const handleLogout = async () => {
    // Sign out from Supabase
    await logoutUser()

    // Clear user from context
    logout()

    // Redirect to login page
    router.push("/")
  }

  return (
    <nav className="bg-purple-900 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href={user ? "/feed" : "/"} className="flex items-center gap-2">
          <Image src="/logo.png" alt="Public Ripple Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">Public Ripple</span>
        </Link>
        <div className="space-x-4">
          {user && (
            <>
              <Link href="/feed">
                <Button variant="ghost" className="text-white hover:text-gray-300">
                  Feed
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="text-white hover:text-gray-300">
                  Profile
                </Button>
              </Link>
              <Button variant="ghost" className="text-white hover:text-gray-300" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
