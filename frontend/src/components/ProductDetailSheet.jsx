import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import api from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  ShoppingBagIcon,
  PackageIcon,
  PencilIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  RefreshCwIcon,
} from "lucide-react"

const formatKES = (amount) =>
  new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount || 0)

function getMovementIcon(type) {
  switch (type) {
    case "in":
      return <ArrowDownIcon className="size-3 text-emerald-500 shrink-0" />
    case "out":
      return <ArrowUpIcon className="size-3 text-muted-foreground shrink-0" />
    default:
      return <RefreshCwIcon className="size-3 text-amber-500 shrink-0" />
  }
}

export default function ProductDetailSheet({ product, onOpenChange }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [movements, setMovements] = useState([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movementsFetched, setMovementsFetched] = useState(false)
  const [movementFilter, setMovementFilter] = useState("all")

  const handleTabChange = (value) => {
    if (value === "movements" && !movementsFetched && product?.id) {
      setMovementsLoading(true)
      setMovementsFetched(true)
      api
        .get("/stock-movements/", { params: { product: product.id } })
        .then(({ data }) => setMovements(data.results || data))
        .catch((err) => console.error("Failed to fetch product movements", err))
        .finally(() => setMovementsLoading(false))
    }
  }

  const filteredMovements = useMemo(() => {
    if (movementFilter === "all") return movements
    return movements.filter((m) => m.movement_type === movementFilter)
  }, [movements, movementFilter])

  const totalIn = useMemo(
    () => movements.filter((m) => m.movement_type === "in").reduce((s, m) => s + m.quantity, 0),
    [movements]
  )

  const totalOut = useMemo(
    () => movements.filter((m) => m.movement_type === "out").reduce((s, m) => s + m.quantity, 0),
    [movements]
  )

  if (!product) return null

  const sellingPrice = parseFloat(product.selling_price) || 0
  const buyingPrice = parseFloat(product.buying_price) || 0
  const profitPerUnit = sellingPrice - buyingPrice
  const marginPercent =
    sellingPrice > 0 ? (((sellingPrice - buyingPrice) / sellingPrice) * 100).toFixed(1) : 0

  const totalStockCost = buyingPrice * product.quantity

  return (
    <Sheet open={!!product} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0 space-y-1">
          {product.category_name && (
            <div className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
              {product.category_name}
            </div>
          )}

          <SheetTitle className="text-lg font-semibold text-foreground leading-snug">
            {product.name}
          </SheetTitle>

          <div className="font-mono text-xs text-muted-foreground pt-0.5">
            {product.sku}
            {product.barcode ? ` • ${product.barcode}` : ""}
          </div>
        </SheetHeader>

        {/* Tabs & Content */}
        <div className="flex-1 overflow-y-auto px-6 pt-4">
          <Tabs key={product.id} defaultValue="overview" onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="movements" className="flex-1">
                Movements {movements.length > 0 && `(${movements.length})`}
              </TabsTrigger>
            </TabsList>

            {/* ================= OVERVIEW TAB ================= */}
            <TabsContent value="overview" className="pt-4 space-y-5">
              {/* Top Hero: Price & Stock side by side */}
              <div className="grid grid-cols-2 gap-4 pb-1">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Selling Price
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-primary">
                    {formatKES(sellingPrice)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Retail per unit
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    On-Hand Stock
                  </div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {product.quantity} <span className="text-sm font-normal text-muted-foreground">units</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Alert threshold: {product.reorder_level || 5} pcs
                  </div>
                </div>
              </div>

              {/* Section: Financials & Margins (Admin Only) */}
              {user?.role === "admin" && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Financials & Margins
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Buying Cost (Unit)</span>
                        <p className="font-medium text-foreground mt-0.5">
                          {formatKES(buyingPrice)}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Profit per Unit</span>
                        <p
                          className={`font-medium mt-0.5 ${
                            profitPerUnit >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-destructive"
                          }`}
                        >
                          {profitPerUnit >= 0
                            ? `+${formatKES(profitPerUnit)}`
                            : formatKES(profitPerUnit)}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Gross Margin</span>
                        <p className="font-medium text-foreground mt-0.5">
                          {marginPercent}%
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Total Stock Cost</span>
                        <p className="font-semibold text-foreground mt-0.5">
                          {formatKES(totalStockCost)}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Section: Product Details */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Details
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">SKU Code</span>
                    <p className="font-mono text-foreground font-medium mt-0.5">
                      {product.sku}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Barcode</span>
                    <p className="font-mono text-foreground mt-0.5">
                      {product.barcode || "—"}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Category</span>
                    <p className="text-foreground mt-0.5">
                      {product.category_name || "Uncategorized"}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Catalogue Status</span>
                    <p className="text-foreground mt-0.5 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {product.is_active !== false ? "Active" : "Archived"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ================= MOVEMENTS TAB ================= */}
            <TabsContent value="movements" className="pt-4 space-y-3">
              {/* Polished Summary & Filter Controls */}
              {movements.length > 0 && (
                <div className="space-y-3">
                  {/* Styled Summary Bar */}
                  <div className="grid grid-cols-2 divide-x rounded-lg bg-muted/30 border text-xs">
                    <div className="flex items-center gap-1.5 px-3 py-2">
                      <ArrowDownIcon className="size-3.5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">In:</span>
                      <span className="font-semibold text-foreground">+{totalIn} units</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2">
                      <ArrowUpIcon className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Out:</span>
                      <span className="font-semibold text-foreground">-{totalOut} units</span>
                    </div>
                  </div>

                  {/* Standard Button Group for Filters */}
                  <div data-slot="button-group" className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5 w-fit">
                    {[
                      { label: "All", value: "all" },
                      { label: "Stock In", value: "in" },
                      { label: "Stock Out", value: "out" },
                      { label: "Adjustments", value: "adjustment" },
                    ].map((opt) => (
                      <Button
                        key={opt.value}
                        variant={movementFilter === opt.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => setMovementFilter(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {movementsLoading ? (
                <div className="flex items-center justify-center py-12 text-xs text-muted-foreground">
                  Loading movements...
                </div>
              ) : filteredMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1.5 py-12 text-muted-foreground">
                  <PackageIcon className="size-6 opacity-40" />
                  <p className="text-xs">
                    {movements.length === 0 ? "No stock movements recorded yet." : "No movements match this filter."}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="text-[11px]">
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovements.map((m) => {
                        const isIn = m.movement_type === "in"

                        return (
                          <TableRow key={m.id} className="text-xs">
                            <TableCell className="py-2">
                              <div className="flex items-center gap-1.5 capitalize text-[11px]">
                                {getMovementIcon(m.movement_type)}
                                <span>{m.movement_type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right py-2 font-mono font-medium">
                              <span className={isIn ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-muted-foreground"}>
                                {isIn ? `+${m.quantity}` : `-${m.quantity}`}
                              </span>
                            </TableCell>
                            <TableCell className="py-2 text-[11px] text-muted-foreground max-w-[120px] truncate">
                              {m.reference || "—"}
                            </TableCell>
                            <TableCell className="text-right py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                              {new Date(m.created_at).toLocaleDateString("en-KE", {
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Permanent Footer Actions */}
        <div className="shrink-0 border-t px-6 py-4 space-y-2 bg-background">
          <Button
            onClick={() => {
              const id = product.id
              onOpenChange(false)
              navigate(`/pos?add=${id}`)
            }}
            className="w-full h-10 gap-2 font-medium cursor-pointer"
          >
            <ShoppingBagIcon className="size-4" />
            Start a Sale
          </Button>

          {user?.role === "admin" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const id = product.id
                  onOpenChange(false)
                  navigate(`/inventory?action=edit-product&id=${id}`)
                }}
                className="flex-1 h-9 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <PencilIcon className="size-3.5" />
                Edit Product
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onOpenChange(false)
                  navigate("/inventory")
                }}
                className="flex-1 h-9 gap-1.5 text-xs font-medium text-muted-foreground cursor-pointer"
              >
                <PackageIcon className="size-3.5" />
                View in Inventory
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
