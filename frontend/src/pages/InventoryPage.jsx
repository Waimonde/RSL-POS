import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import api from "@/api/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  SearchIcon,
  PackageIcon,
  BoxesIcon,
  TagIcon,
  CalendarIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  RefreshCwIcon,
} from "lucide-react"
import ProductDetailSheet from "@/components/ProductDetailSheet"

const emptyProduct = {
  name: "",
  sku: "",
  barcode: "",
  category: "",
  buying_price: "",
  selling_price: "",
  quantity: "",
  reorder_level: "10",
}

const emptyCategory = {
  name: "",
  description: "",
}

const emptyReceiveForm = {
  product: "",
  quantity: "",
  reference: "",
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)

  // Products state
  const [productSearch, setProductSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [productSheetOpen, setProductSheetOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [productFormError, setProductFormError] = useState("")
  const [productSaving, setProductSaving] = useState(false)
  const [deleteProductOpen, setDeleteProductOpen] = useState(false)
  const [deletingProduct, setDeletingProduct] = useState(null)
  const [viewingProduct, setViewingProduct] = useState(null)

  // Categories state
  const [categorySearch, setCategorySearch] = useState("")
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategory)
  const [categoryFormError, setCategoryFormError] = useState("")
  const [categorySaving, setCategorySaving] = useState(false)
  const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)

  // Stock receive state
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receiveForm, setReceiveForm] = useState(emptyReceiveForm)
  const [receiveFormError, setReceiveFormError] = useState("")
  const [receiveSaving, setReceiveSaving] = useState(false)

  // Stock movements filter state
  const [movementTypeFilter, setMovementTypeFilter] = useState("all")
  const [movementTimeFilter, setMovementTimeFilter] = useState("all")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })

  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const action = searchParams.get("action")
    if (action === "add-product") {
      setEditingProduct(null)
      setProductForm(emptyProduct)
      setProductSheetOpen(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete("action")
      setSearchParams(nextParams, { replace: true })
    } else if (action === "edit-product") {
      const id = searchParams.get("id")
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete("action")
      nextParams.delete("id")
      setSearchParams(nextParams, { replace: true })
      if (id) {
        api.get(`/products/${id}/`).then(({ data }) => {
          if (data) openEditProduct(data)
        }).catch((err) => console.error("Failed to load product to edit", err))
      }
    } else if (action === "receive-stock" || action === "stock-in") {
      setActiveTab("movements")
      setReceiveOpen(true)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete("action")
      setSearchParams(nextParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  // --- Data Fetching ---

  const fetchProducts = useCallback(async () => {
    try {
      const params = {}
      if (productSearch) params.search = productSearch
      if (categoryFilter && categoryFilter !== "all") params.category = categoryFilter
      const { data } = await api.get("/products/", { params })
      setProducts(data.results || data)
    } catch (err) {
      console.error("Failed to fetch products", err)
    } finally {
      setLoading(false)
    }
  }, [productSearch, categoryFilter])

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/categories/")
      setCategories(data.results || data)
    } catch (err) {
      console.error("Failed to fetch categories", err)
    }
  }, [])

  const fetchMovements = useCallback(async () => {
    try {
      const { data } = await api.get("/stock-movements/")
      setMovements(data.results || data)
    } catch (err) {
      console.error("Failed to fetch stock movements", err)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    const debounce = setTimeout(() => fetchProducts(), 300)
    return () => clearTimeout(debounce)
  }, [fetchProducts])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  // --- Product Handlers ---

  const openAddProduct = () => {
    setEditingProduct(null)
    setProductForm(emptyProduct)
    setProductFormError("")
    setProductSheetOpen(true)
  }

  const openEditProduct = (product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || "",
      category: product.category ? String(product.category) : "none",
      buying_price: product.buying_price,
      selling_price: product.selling_price,
      quantity: product.quantity,
      reorder_level: product.reorder_level,
    })
    setProductFormError("")
    setProductSheetOpen(true)
  }

  const handleProductFormChange = (field, value) => {
    setProductForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveProduct = async () => {
    setProductFormError("")
    if (!productForm.name || !productForm.sku || !productForm.buying_price || !productForm.selling_price) {
      setProductFormError("Name, SKU, and prices are required.")
      return
    }
    setProductSaving(true)
    try {
      const payload = {
        ...productForm,
        category: productForm.category && productForm.category !== "none" ? parseInt(productForm.category) : null,
        quantity: parseInt(productForm.quantity) || 0,
        reorder_level: parseInt(productForm.reorder_level) || 10,
        buying_price: parseFloat(productForm.buying_price),
        selling_price: parseFloat(productForm.selling_price),
      }
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}/`, payload)
      } else {
        await api.post("/products/create/", payload)
      }
      setProductSheetOpen(false)
      fetchProducts()
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(", ") ||
        "Failed to save product."
      setProductFormError(msg)
    } finally {
      setProductSaving(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return
    try {
      await api.delete(`/products/${deletingProduct.id}/`)
      setDeleteProductOpen(false)
      setDeletingProduct(null)
      fetchProducts()
    } catch (err) {
      console.error("Failed to delete product", err)
    }
  }

  // --- Category Handlers ---

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((cat) => cat.name.toLowerCase().includes(q))
  }, [categories, categorySearch])

  const openAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm(emptyCategory)
    setCategoryFormError("")
    setCategorySheetOpen(true)
  }

  const openEditCategory = (category) => {
    setEditingCategory(category)
    setCategoryForm({ name: category.name, description: category.description || "" })
    setCategoryFormError("")
    setCategorySheetOpen(true)
  }

  const handleCategoryFormChange = (field, value) => {
    setCategoryForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveCategory = async () => {
    setCategoryFormError("")
    if (!categoryForm.name) {
      setCategoryFormError("Category name is required.")
      return
    }
    setCategorySaving(true)
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}/`, categoryForm)
      } else {
        await api.post("/categories/create/", categoryForm)
      }
      setCategorySheetOpen(false)
      fetchCategories()
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(", ") ||
        "Failed to save category."
      setCategoryFormError(msg)
    } finally {
      setCategorySaving(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return
    try {
      await api.delete(`/categories/${deletingCategory.id}/`)
      setDeleteCategoryOpen(false)
      setDeletingCategory(null)
      fetchCategories()
    } catch (err) {
      console.error("Failed to delete category", err)
    }
  }

  // --- Stock Receive Handlers ---

  const handleReceiveFormChange = (field, value) => {
    setReceiveForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleReceiveStock = async () => {
    setReceiveFormError("")
    if (!receiveForm.product || !receiveForm.quantity || !receiveForm.reference) {
      setReceiveFormError("Product, quantity, and reference are required.")
      return
    }
    setReceiveSaving(true)
    try {
      await api.post("/stock-receive/", {
        product: parseInt(receiveForm.product),
        quantity: parseInt(receiveForm.quantity),
        reference: receiveForm.reference,
      })
      setReceiveOpen(false)
      fetchProducts()
      fetchMovements()
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(", ") ||
        "Failed to receive stock."
      setReceiveFormError(msg)
    } finally {
      setReceiveSaving(false)
    }
  }

  // --- Helpers ---

  const filteredMovements = movements.filter((m) => {
    if (movementTypeFilter !== "all" && m.movement_type !== movementTypeFilter) return false
    const date = new Date(m.created_at)
    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from)
      from.setHours(0, 0, 0, 0)
      const to = new Date(dateRange.to)
      to.setHours(23, 59, 59, 999)
      if (date < from || date > to) return false
    } else if (movementTimeFilter !== "all") {
      const now = new Date()
      if (movementTimeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (date < today) return false
      } else if (movementTimeFilter === "week") {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        if (date < weekAgo) return false
      } else if (movementTimeFilter === "month") {
        if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) return false
      }
    }
    return true
  })

  const formatKES = (amount) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount)

  const getMovementIcon = (type) => {
    switch (type) {
      case "in": return <ArrowDownIcon className="size-4 text-green-500" />
      case "out": return <ArrowUpIcon className="size-4 text-red-500" />
      default: return <RefreshCwIcon className="size-4 text-yellow-500" />
    }
  }

  const getProductCount = (categoryId) =>
    products.filter((p) => p.category === categoryId).length

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage products, stock movements, and categories.</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "products" && (
            <>
              <Button variant="outline" onClick={() => setReceiveOpen(true)} className="gap-1.5">
                <PlusIcon className="size-4" />
                Receive Stock
              </Button>
              <Button onClick={openAddProduct} className="gap-1.5">
                <PlusIcon className="size-4" />
                Add Product
              </Button>
            </>
          )}
          {activeTab === "movements" && (
            <Button onClick={() => setReceiveOpen(true)} className="gap-1.5">
              <PlusIcon className="size-4" />
              Receive Stock
            </Button>
          )}
          {activeTab === "categories" && (
            <Button onClick={openAddCategory} className="gap-1.5">
              <PlusIcon className="size-4" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">
            <PackageIcon className="size-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="movements">
            <RefreshCwIcon className="size-4" />
            Stock Movements
          </TabsTrigger>
          <TabsTrigger value="categories">
            <TagIcon className="size-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        {/* --- Products Tab --- */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name or SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-8 w-48 pl-8 text-sm"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-40 text-sm">
                    <SelectValue placeholder="All Categories">
                      {(val) => {
                        if (!val || val === "all") return "All Categories"
                        const found = categories.find((c) => String(c.id) === String(val))
                        return found ? found.name : val
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <PackageIcon className="size-8" />
                  <p>No products found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                        <TableCell>{product.category_name || "—"}</TableCell>
                        <TableCell className="text-right">{formatKES(product.selling_price)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              product.quantity <= product.reorder_level
                                ? "text-destructive font-medium"
                                : ""
                            }
                          >
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.quantity <= product.reorder_level ? "destructive" : "secondary"}>
                            {product.quantity <= product.reorder_level ? "Low Stock" : "In Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => setViewingProduct(product)}>
                              <EyeIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditProduct(product)}>
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => { setDeletingProduct(product); setDeleteProductOpen(true) }}>
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Stock Movements Tab --- */}
        <TabsContent value="movements">
          <Card className="overflow-visible">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-sm font-medium">
                  {filteredMovements.length} movement{filteredMovements.length !== 1 ? "s" : ""}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div data-slot="button-group" className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5">
                    {[
                      { label: "All", value: "all" },
                      { label: "In", value: "in" },
                      { label: "Out", value: "out" },
                      { label: "Adjustment", value: "adjustment" },
                    ].map((opt) => (
                      <Button
                        key={opt.value}
                        variant={movementTypeFilter === opt.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => setMovementTypeFilter(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                  <div data-slot="button-group" className="flex items-center rounded-lg border bg-muted/30 p-0.5 gap-0.5">
                    {[
                      { label: "All", value: "all" },
                      { label: "Today", value: "today" },
                      { label: "Week", value: "week" },
                      { label: "Month", value: "month" },
                    ].map((opt) => (
                      <Button
                        key={opt.value}
                        variant={!dateRange.from && movementTimeFilter === opt.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => {
                          setMovementTimeFilter(opt.value)
                          setDateRange({ from: undefined, to: undefined })
                        }}
                      >
                        {opt.label}
                      </Button>
                    ))}
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            variant={dateRange.from ? "default" : "ghost"}
                            size="sm"
                            className="h-7 w-7 p-0"
                          />
                        }
                      >
                        <CalendarIcon className="size-3.5" />
                      </PopoverTrigger>
                      <PopoverContent align="end" side="bottom" sideOffset={6} className="w-auto p-2">
                        <Calendar
                          mode="range"
                          selected={dateRange.from ? dateRange : undefined}
                          onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                          numberOfMonths={1}
                        />
                        {dateRange.from && (
                          <div className="flex justify-end border-t pt-2 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDateRange({ from: undefined, to: undefined })
                                setCalendarOpen(false)
                              }}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <RefreshCwIcon className="size-8" />
                  <p>{movements.length === 0 ? "No stock movements yet." : "No movements match the selected filters."}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {getMovementIcon(m.movement_type)}
                            <span className="capitalize">{m.movement_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{m.product_name}</TableCell>
                        <TableCell className="text-right">{m.quantity}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.reference}</TableCell>
                        <TableCell>{m.user_name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(m.created_at).toLocaleDateString("en-KE")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Categories Tab --- */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="h-8 w-48 pl-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <TagIcon className="size-8" />
                  <p>No categories yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Products</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{cat.description || "—"}</TableCell>
                        <TableCell className="text-right">{getProductCount(cat.id)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEditCategory(cat)}>
                              <PencilIcon className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => { setDeletingCategory(cat); setDeleteCategoryOpen(true) }}>
                              <TrashIcon className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- Product Form Sheet --- */}
      <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>{editingProduct ? "Edit Product" : "Add Product"}</SheetTitle>
            <SheetDescription>
              {editingProduct ? "Update product details." : "Add a new product to your catalog."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input value={productForm.name} onChange={(e) => handleProductFormChange("name", e.target.value)} placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>SKU *</Label>
                  <Input value={productForm.sku} onChange={(e) => handleProductFormChange("sku", e.target.value)} placeholder="e.g. PRD-001" />
                </div>
                <div className="grid gap-2">
                  <Label>Barcode</Label>
                  <Input value={productForm.barcode} onChange={(e) => handleProductFormChange("barcode", e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={productForm.category || "none"}
                  onValueChange={(v) => handleProductFormChange("category", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category (Optional)">
                      {(val) => {
                        if (!val || val === "none") return "None (Uncategorized)"
                        const found = categories.find((c) => String(c.id) === String(val))
                        return found ? found.name : val
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Uncategorized)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Buying Price *</Label>
                  <Input type="number" step="0.01" min="0" value={productForm.buying_price} onChange={(e) => handleProductFormChange("buying_price", e.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label>Selling Price *</Label>
                  <Input type="number" step="0.01" min="0" value={productForm.selling_price} onChange={(e) => handleProductFormChange("selling_price", e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quantity</Label>
                  <Input type="number" min="0" value={productForm.quantity} onChange={(e) => handleProductFormChange("quantity", e.target.value)} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Reorder Level</Label>
                  <Input type="number" min="0" value={productForm.reorder_level} onChange={(e) => handleProductFormChange("reorder_level", e.target.value)} placeholder="10" />
                </div>
              </div>
              {productFormError && <p className="text-sm text-destructive">{productFormError}</p>}
            </div>
          </div>
          <SheetFooter className="border-t px-4 py-3">
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
            <Button onClick={handleSaveProduct} disabled={productSaving}>
              {productSaving ? "Saving..." : editingProduct ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* --- Product Delete Dialog --- */}
      <Dialog open={deleteProductOpen} onOpenChange={setDeleteProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingProduct?.name}</strong>? This will
              deactivate the product. Historical sales data will be preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Category Form Sheet --- */}
      <Sheet open={categorySheetOpen} onOpenChange={setCategorySheetOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>{editingCategory ? "Edit Category" : "Add Category"}</SheetTitle>
            <SheetDescription>
              {editingCategory ? "Update category details." : "Add a new product category."}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Name *</Label>
                <Input value={categoryForm.name} onChange={(e) => handleCategoryFormChange("name", e.target.value)} placeholder="Category name" />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryFormChange("description", e.target.value)}
                  placeholder="Optional description"
                  rows={4}
                  className="resize-none"
                />
              </div>
              {categoryFormError && <p className="text-sm text-destructive">{categoryFormError}</p>}
            </div>
          </div>
          <SheetFooter className="border-t px-4 py-3">
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
            <Button onClick={handleSaveCategory} disabled={categorySaving}>
              {categorySaving ? "Saving..." : editingCategory ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* --- Category Delete Dialog --- */}
      <Dialog open={deleteCategoryOpen} onOpenChange={setDeleteCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingCategory?.name}</strong>? Products
              in this category will become uncategorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDeleteCategory}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Receive Stock Sheet --- */}
      <Sheet open={receiveOpen} onOpenChange={setReceiveOpen}>
        <SheetContent side="right" className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Receive Stock</SheetTitle>
            <SheetDescription>Record incoming stock for a product.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Product *</Label>
                <Select
                  value={receiveForm.product ? String(receiveForm.product) : ""}
                  onValueChange={(v) => handleReceiveFormChange("product", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select product">
                      {(val) => {
                        if (!val) return "Select product"
                        const found = products.find((p) => String(p.id) === String(val))
                        return found ? `${found.name} (${found.sku})` : val
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Quantity *</Label>
                <Input type="number" min="1" value={receiveForm.quantity} onChange={(e) => handleReceiveFormChange("quantity", e.target.value)} placeholder="Enter quantity" />
              </div>
              <div className="grid gap-2">
                <Label>Reference *</Label>
                <Input value={receiveForm.reference} onChange={(e) => handleReceiveFormChange("reference", e.target.value)} placeholder="e.g. PO-001, Delivery note" />
              </div>
              {receiveFormError && <p className="text-sm text-destructive">{receiveFormError}</p>}
            </div>
          </div>
          <SheetFooter className="border-t px-4 py-3">
            <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
            <Button onClick={handleReceiveStock} disabled={receiveSaving}>
              {receiveSaving ? "Saving..." : "Receive Stock"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={viewingProduct}
        onOpenChange={(open) => !open && setViewingProduct(null)}
      />
    </div>
  )
}
