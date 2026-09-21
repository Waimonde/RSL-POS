import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import api from "@/api/axios"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  SearchIcon,
  PlusIcon,
  MinusIcon,
  Trash2Icon,
  CreditCardIcon,
  BanknoteIcon,
  SmartphoneIcon,
  ShoppingBagIcon,
  PrinterIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  RotateCcwIcon,
  EyeIcon,
  ArrowRightIcon,
  Loader2Icon,
} from "lucide-react"
import ProductDetailSheet from "@/components/ProductDetailSheet"

export default function PosPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Cart state
  const [cart, setCart] = useState([])
  const [discountPercent, setDiscountPercent] = useState(0)

  // Payment modal state
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash") // "cash" | "mpesa"
  const [cashTendered, setCashTendered] = useState("")
  const [mpesaPhone, setMpesaPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [saleComplete, setSaleComplete] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get("/products/")
      setProducts(data.results || data)
    } catch (err) {
      console.error("Failed to load products", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories/")
      setCategories(data.results || data)
    } catch (err) {
      console.error("Failed to load categories", err)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    const isAllCategories = selectedCategory === "all"

    return products.filter((p) => {
      const matchesCat = isAllCategories || String(p.category) === String(selectedCategory)
      if (!matchesCat) return false
      if (!q) return true

      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      )
    })
  }, [products, search, selectedCategory])

  // Cart actions
  const addToCart = useCallback((product) => {
    if (product.quantity <= 0) return
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        if (existing.qty >= product.quantity) return prev // Stock limit
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  // Handle incoming ?add=productId from header search or elsewhere
  useEffect(() => {
    const addId = searchParams.get("add")
    if (addId && products.length > 0) {
      const productToAdd = products.find((p) => String(p.id) === String(addId))
      if (productToAdd) {
        addToCart(productToAdd)
      }
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete("add")
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, products, addToCart, setSearchParams])

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.qty + delta
            if (newQty > item.quantity) return item // Stock limit
            return newQty > 0 ? { ...item, qty: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setDiscountPercent(0)
  }

  // Financial calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + parseFloat(item.selling_price) * item.qty, 0)
  }, [cart])

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0)
  }, [cart])

  const discountAmount = useMemo(() => {
    return (subtotal * (parseFloat(discountPercent) || 0)) / 100
  }, [subtotal, discountPercent])

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount)
  }, [subtotal, discountAmount])

  const changeDue = useMemo(() => {
    const tendered = parseFloat(cashTendered) || 0
    return Math.max(0, tendered - totalAmount)
  }, [cashTendered, totalAmount])

  const formatKES = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

  // Submit sale
  const handleCompleteSale = async () => {
    setSubmitting(true)
    try {
      const receiptNo = `RCP-${Date.now().toString().slice(-6)}`
      const payload = {
        receipt_number: receiptNo,
        subtotal,
        discount: discountAmount,
        total_amount: totalAmount,
        items: cart.map((i) => ({
          product: i.id,
          quantity: i.qty,
          unit_price: parseFloat(i.selling_price),
        })),
        payment: {
          payment_method: paymentMethod,
          amount: totalAmount,
        },
      }

      // Record simulated completion or API call
      setSaleComplete({
        ...payload,
        cashier_name: user?.display_name || user?.username,
        date: new Date().toLocaleString("en-KE"),
        change: changeDue,
        items_detail: [...cart],
      })
      setCheckoutOpen(false)
      clearCart()
      fetchProducts()
    } catch (err) {
      console.error("Sale error", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col lg:flex-row overflow-hidden">
      {/* LEFT PANEL: Product Grid & Search (Catalog Area) */}
      <div className="flex flex-1 flex-col gap-4 p-4 min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex flex-col gap-3 shrink-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="h-7 text-xs"
          >
            All Products
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={String(selectedCategory) === String(cat.id) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="h-7 text-xs whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Loading catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground text-center">
              <ShoppingBagIcon className="size-8" />
              {products.length === 0 ? (
                <>
                  <p className="font-medium text-sm">No products in catalog yet</p>
                  <p className="text-xs">Add products in Inventory to start ringing up sales.</p>
                </>
              ) : search ? (
                <p className="text-sm">No products found matching "{search}"</p>
              ) : (
                <p className="text-sm">No products found in this category.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pb-6">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.quantity <= 0
                const isLowStock = !isOutOfStock && p.quantity <= (p.reorder_level || 5)

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`group relative flex flex-col justify-between p-4 rounded-xl border transition-colors duration-150 ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed border-dashed bg-muted/30"
                        : "cursor-pointer bg-card hover:border-primary/60 hover:bg-accent/10 active:scale-[0.99]"
                    }`}
                  >
                    {/* Top Section: Product Name & Category Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-semibold text-sm leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1"
                          title={p.name}
                        >
                          {p.name}
                        </h3>
                        {p.category_name && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 shrink-0 max-w-[100px] truncate"
                          >
                            {p.category_name}
                          </Badge>
                        )}
                      </div>

                      {/* Sub-row: SKU on Left, Stock Level on Right */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="font-mono text-xs text-muted-foreground truncate">
                          {p.sku}
                        </span>
                        <span
                          className={`text-xs font-medium shrink-0 ${
                            isOutOfStock
                              ? "text-destructive"
                              : isLowStock
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isOutOfStock
                            ? "Out of stock"
                            : isLowStock
                            ? `${p.quantity} left`
                            : `${p.quantity} in stock`}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Price & Add Button */}
                    <div className="flex items-center justify-between pt-2.5 mt-3 border-t border-border/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Price</span>
                        <span className="font-bold text-base text-primary">
                          {formatKES(p.selling_price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); setViewingProduct(p) }}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="size-4" />
                        </button>
                        {!isOutOfStock && (
                          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-2xs">
                            <PlusIcon className="size-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Sticky Full-Height Active Register Ticket */}
      <div className="sticky top-0 right-0 z-10 flex h-full w-full flex-col shrink-0 border-t lg:border-t-0 lg:border-l bg-card shadow-sm lg:w-96 xl:w-[420px] overflow-hidden">
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card shrink-0">
          <div className="flex items-center gap-2 font-bold text-base">
            <ShoppingBagIcon className="size-5 text-primary" />
            <span>Cart ({cart.reduce((s, i) => s + i.qty, 0)})</span>
          </div>
          {cart.length > 0 && (
            <Button variant="ghost" size="xs" onClick={clearCart} className="text-destructive hover:bg-destructive/10 gap-1">
              <RotateCcwIcon className="size-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-3">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ShoppingBagIcon className="size-10 stroke-1" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs">Click items on the catalog to begin sale</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 bg-background">
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatKES(item.selling_price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => updateQty(item.id, -1)}
                    >
                      <MinusIcon className="size-3" />
                    </Button>
                    <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      onClick={() => updateQty(item.id, 1)}
                      disabled={item.qty >= item.quantity}
                    >
                      <PlusIcon className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeFromCart(item.id)}
                      className="text-destructive hover:bg-destructive/10 ml-1"
                    >
                      <Trash2Icon className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Totals & Checkout */}
        <div className="border-t bg-muted/20 p-4 space-y-3 shrink-0">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatKES(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount ({discountPercent}%)</span>
                <span>-{formatKES(discountAmount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between text-base font-bold">
              <span>Grand Total</span>
              <span className="text-lg text-primary">{formatKES(totalAmount)}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full h-12 px-4 flex items-center justify-between text-sm font-semibold rounded-xl shadow-md transition-all group hover:shadow-lg cursor-pointer"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="size-4.5" />
              <span>Pay Now</span>
              {totalItemsCount > 0 && (
                <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs font-bold">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-base font-bold">
              <span>{formatKES(totalAmount)}</span>
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Total due: <span className="font-semibold text-foreground font-mono">{formatKES(totalAmount)}</span>
              {discountAmount > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400 ml-1">
                  ({discountPercent}% discount)
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Payment Method Tabs */}
            <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="cash" className="gap-1.5 cursor-pointer">
                  <BanknoteIcon className="size-3.5" />
                  Cash
                </TabsTrigger>
                <TabsTrigger value="mpesa" className="gap-1.5 cursor-pointer">
                  <SmartphoneIcon className="size-3.5" />
                  M-Pesa
                </TabsTrigger>
              </TabsList>

              {/* Cash Flow */}
              <TabsContent value="cash" className="space-y-3.5 pt-3">
                <div className="space-y-2">
                  <Label htmlFor="cash-tendered-input" className="text-xs">
                    Cash Received
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      KES
                    </span>
                    <Input
                      id="cash-tendered-input"
                      type="number"
                      placeholder="0.00"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="h-10 pl-11 font-mono font-semibold"
                      autoFocus
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setCashTendered(String(totalAmount))}
                      className={parseFloat(cashTendered) === totalAmount ? "bg-accent font-semibold" : ""}
                    >
                      Exact
                    </Button>
                    {[500, 1000, 2000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setCashTendered(String(amt))}
                        className={parseFloat(cashTendered) === amt ? "bg-accent font-semibold" : ""}
                      >
                        KES {amt.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Change Due summary bar */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3.5 py-2.5 text-xs">
                  <span className="text-muted-foreground font-medium">Change Due:</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      parseFloat(cashTendered) >= totalAmount && changeDue > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {parseFloat(cashTendered) >= totalAmount ? formatKES(changeDue) : "KES 0.00"}
                  </span>
                </div>
              </TabsContent>

              {/* M-Pesa Flow */}
              <TabsContent value="mpesa" className="space-y-3.5 pt-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mpesa-phone-input" className="text-xs">
                    Customer Phone Number
                  </Label>
                  <Input
                    id="mpesa-phone-input"
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="h-10 font-mono"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    An STK push for {formatKES(totalAmount)} will be sent to the customer's phone.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm" className="cursor-pointer" />}>
              Cancel
            </DialogClose>
            <Button
              size="sm"
              onClick={handleCompleteSale}
              disabled={
                submitting ||
                (paymentMethod === "cash" && (parseFloat(cashTendered) || 0) < totalAmount)
              }
              className="gap-1.5 cursor-pointer font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Sale"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Thermal Receipt Print Modal */}
      {saleComplete && (
        <Dialog open={!!saleComplete} onOpenChange={() => setSaleComplete(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2Icon className="size-5" />
                Sale Completed
              </DialogTitle>
              <DialogDescription>Receipt #{saleComplete.receipt_number}</DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border bg-card p-4 font-mono text-xs space-y-2">
              <div className="text-center font-bold text-sm">RYANTECH SOLUTIONS LTD</div>
              <div className="text-center text-[10px] text-muted-foreground">Luther Plaza, Nairobi</div>
              <Separator />
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{saleComplete.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span>{saleComplete.cashier_name}</span>
              </div>
              <Separator />
              <div className="space-y-1">
                {saleComplete.items_detail.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.name} x{i.qty}</span>
                    <span>{formatKES(i.selling_price * i.qty)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-sm">
                <span>TOTAL:</span>
                <span>{formatKES(saleComplete.total_amount)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>PAID VIA:</span>
                <span className="uppercase">{saleComplete.payment.payment_method}</span>
              </div>
              {saleComplete.payment.payment_method === "cash" && (
                <div className="flex justify-between text-muted-foreground">
                  <span>CHANGE:</span>
                  <span>{formatKES(saleComplete.change)}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSaleComplete(null)}>Done</Button>
              <Button onClick={() => window.print()} className="gap-1.5">
                <PrinterIcon className="size-4" />
                Print Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
      />
    </div>
  )
}
