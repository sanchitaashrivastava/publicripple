"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-purple-900 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Public Ripple Logo" width={40} height={40} className="h-10 w-auto" />
          <span className="text-xl font-bold text-white">Public Ripple</span>
        </Link>
        <div className="space-x-4">
          {pathname !== "/" && (
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
              <Link href="/">
                <Button variant="ghost" className="text-white hover:text-gray-300">
                  Logout
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

