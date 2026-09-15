import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LogOutIcon, UserIcon, SettingsIcon, ChevronDownIcon, SunIcon, MoonIcon, SearchIcon } from "lucide-react"

function getInitials(name) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function getTheme() {
  return localStorage.getItem("theme") || "dark"
}

function setTheme(theme) {
  localStorage.setItem("theme", theme)
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.classList.toggle("light", theme === "light")
}

export default function AppHeader() {
  const { user, logout } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setThemeState] = useState(getTheme)
  const menuRef = useRef(null)

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const handleLogout = () => {
    setMenuOpen(false)
    setShowLogoutDialog(false)
    logout()
  }

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    setThemeState(next)
    setTheme(next)
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1" />
        <div className="relative hidden sm:block">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-8 w-48 rounded-md border bg-muted px-8 text-sm outline-none focus:w-64 transition-[width]"
          />
        </div>
        <Separator orientation="vertical" className="!h-5 my-3.5" />
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </Button>
        <Separator orientation="vertical" className="!h-5 my-3.5" />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground outline-none"
          >
            <Avatar size="sm">
              <AvatarFallback>{getInitials(user?.display_name || user?.username)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline-block">
              {user?.display_name || user?.username}
            </span>
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.display_name || user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Separator />
              <button
                disabled
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm opacity-50 cursor-not-allowed"
              >
                <UserIcon className="size-4" />
                Profile
              </button>
              <button
                disabled
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm opacity-50 cursor-not-allowed"
              >
                <SettingsIcon className="size-4" />
                Settings
              </button>
              <Separator />
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setShowLogoutDialog(true)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOutIcon className="size-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-xl bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10">
            <h2 className="text-base font-semibold">Sign Out</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Are you sure you want to sign out? You will need to log in again.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
