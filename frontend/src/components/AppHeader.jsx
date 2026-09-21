import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import api from "@/api/axios"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import ProductDetailSheet from "@/components/ProductDetailSheet"
import ProfileDialog from "@/components/ProfileDialog"
import {
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  SearchIcon,
  Loader2Icon,
  XIcon,
} from "lucide-react"

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

const formatKES = (amount) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

export default function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [theme, setThemeState] = useState(getTheme)

  // Live Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const searchContainerRef = useRef(null)

  useEffect(() => {
    setTheme(theme)
  }, [theme])

  // Handle click outside search results
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Live debounced search
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setSearchResults([])
      setSearching(false)
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/products/", { params: { search: q } })
        setSearchResults(data.results || data || [])
      } catch (err) {
        console.error("Search error", err)
      } finally {
        setSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setSearchOpen(false)
    setSearchQuery("")
  }

  const handleLogout = () => {
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
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1" />

        {/* Global Live Search Bar */}
        <div className="relative hidden sm:block" ref={searchContainerRef}>
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products, SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchOpen(true)
            }}
            onFocus={() => setSearchOpen(true)}
            className="h-8 w-52 rounded-md border bg-muted pl-8 pr-8 text-sm outline-none focus:w-72 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          {searching ? (
            <Loader2Icon className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                setSearchResults([])
                setSearchOpen(false)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-4.5 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted-foreground/15 cursor-pointer transition-colors"
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </button>
          ) : null}

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 top-full mt-1.5 w-80 rounded-xl border bg-popover p-1.5 text-popover-foreground shadow-xl ring-1 ring-foreground/10 z-50">
              <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Products {searchResults.length > 0 && `(${searchResults.length})`}
              </div>
              <Separator className="my-1" />

              {searching ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                  <Loader2Icon className="size-4 animate-spin text-primary" />
                  Searching catalog...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No products found for "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {searchResults.slice(0, 8).map((product) => {
                    const isOutOfStock = product.quantity <= 0
                    const isLow = !isOutOfStock && product.quantity <= (product.reorder_level || 5)

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="flex items-center justify-between rounded-lg p-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-xs leading-tight truncate">
                            {product.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                            <span className="font-mono">{product.sku}</span>
                            {product.category_name && <span>• {product.category_name}</span>}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-bold text-xs text-primary">
                            {formatKES(product.selling_price)}
                          </span>
                          <span
                            className={`text-[10px] font-medium ${
                              isOutOfStock
                                ? "text-destructive"
                                : isLow
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {isOutOfStock ? "Out" : `${product.quantity} pcs`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="!h-5 my-3.5" />
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </Button>
        <Separator orientation="vertical" className="!h-5 my-3.5" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground outline-none transition-colors cursor-pointer select-none"
            aria-label="User account menu"
          >
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {getInitials(user?.display_name || user?.username)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground md:inline-block">
              {user?.display_name || user?.username}
            </span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground ml-0.5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-56 p-1.5">
            <DropdownMenuLabel className="font-normal px-2 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-foreground">
                  {user?.display_name || user?.username}
                </p>
                {user?.email ? (
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowProfileDialog(true)}
              className="cursor-pointer py-2"
            >
              <UserIcon className="size-4" />
              My Profile
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem
                disabled
                className="cursor-not-allowed opacity-50 py-2"
              >
                <SettingsIcon className="size-4" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowLogoutDialog(true)}
              className="cursor-pointer py-2"
            >
              <LogOutIcon className="size-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      {/* User Profile Dialog */}
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />

      {/* Logout Dialog */}
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
