import { useState, useMemo, memo, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart } from "recharts";
import {
  DollarSignIcon,
  ShoppingCartIcon,
  AlertTriangleIcon,
  UsersIcon,
  PlusCircleIcon,
  PackageIcon,
  TruckIcon,
  CalendarIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const timeFilters = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

const quickActions = [
  {
    title: "New Sale",
    icon: PlusCircleIcon,
    route: "/sales/new",
    disabled: true,
  },
  {
    title: "Add Product",
    icon: PackageIcon,
    route: "/products/new",
    disabled: true,
  },
  {
    title: "Receive Stock",
    icon: TruckIcon,
    route: "/stock/receive",
    disabled: true,
  },
];

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

const salesData = {
  today: [
    { label: "8am", sales: 12500, date: new Date(year, month, today.getDate(), 8) },
    { label: "9am", sales: 8700, date: new Date(year, month, today.getDate(), 9) },
    { label: "10am", sales: 15200, date: new Date(year, month, today.getDate(), 10) },
    { label: "11am", sales: 22400, date: new Date(year, month, today.getDate(), 11) },
    { label: "12pm", sales: 31000, date: new Date(year, month, today.getDate(), 12) },
    { label: "1pm", sales: 18900, date: new Date(year, month, today.getDate(), 13) },
    { label: "2pm", sales: 14300, date: new Date(year, month, today.getDate(), 14) },
    { label: "3pm", sales: 19800, date: new Date(year, month, today.getDate(), 15) },
    { label: "4pm", sales: 16500, date: new Date(year, month, today.getDate(), 16) },
    { label: "5pm", sales: 9200, date: new Date(year, month, today.getDate(), 17) },
  ],
  week: [
    { label: "Mon", sales: 125000, date: new Date(year, month, today.getDate() - ((today.getDay() + 6) % 7)) },
    { label: "Tue", sales: 98000, date: new Date(year, month, today.getDate() - ((today.getDay() + 5) % 7)) },
    { label: "Wed", sales: 142000, date: new Date(year, month, today.getDate() - ((today.getDay() + 4) % 7)) },
    { label: "Thu", sales: 167000, date: new Date(year, month, today.getDate() - ((today.getDay() + 3) % 7)) },
    { label: "Fri", sales: 189000, date: new Date(year, month, today.getDate() - ((today.getDay() + 2) % 7)) },
    { label: "Sat", sales: 215000, date: new Date(year, month, today.getDate() - ((today.getDay() + 1) % 7)) },
    { label: "Sun", sales: 78000, date: new Date(year, month, today.getDate() - ((today.getDay() + 0) % 7)) },
  ],
  month: [
    { label: "Week 1", sales: 485000, date: new Date(year, month, 1) },
    { label: "Week 2", sales: 523000, date: new Date(year, month, 8) },
    { label: "Week 3", sales: 612000, date: new Date(year, month, 15) },
    { label: "Week 4", sales: 478000, date: new Date(year, month, 22) },
  ],
  year: [
    { label: "Jan", sales: 1850000, date: new Date(year, 0, 1) },
    { label: "Feb", sales: 1620000, date: new Date(year, 1, 1) },
    { label: "Mar", sales: 2100000, date: new Date(year, 2, 1) },
    { label: "Apr", sales: 1980000, date: new Date(year, 3, 1) },
    { label: "May", sales: 2340000, date: new Date(year, 4, 1) },
    { label: "Jun", sales: 2150000, date: new Date(year, 5, 1) },
    { label: "Jul", sales: 2480000, date: new Date(year, 6, 1) },
    { label: "Aug", sales: 2210000, date: new Date(year, 7, 1) },
    { label: "Sep", sales: 2560000, date: new Date(year, 8, 1) },
    { label: "Oct", sales: 2390000, date: new Date(year, 9, 1) },
    { label: "Nov", sales: 2720000, date: new Date(year, 10, 1) },
    { label: "Dec", sales: 3100000, date: new Date(year, 11, 1) },
  ],
};

const transactionsData = {
  today: [
    { label: "8am", transactions: 4, date: new Date(year, month, today.getDate(), 8) },
    { label: "9am", transactions: 3, date: new Date(year, month, today.getDate(), 9) },
    { label: "10am", transactions: 6, date: new Date(year, month, today.getDate(), 10) },
    { label: "11am", transactions: 9, date: new Date(year, month, today.getDate(), 11) },
    { label: "12pm", transactions: 12, date: new Date(year, month, today.getDate(), 12) },
    { label: "1pm", transactions: 7, date: new Date(year, month, today.getDate(), 13) },
    { label: "2pm", transactions: 5, date: new Date(year, month, today.getDate(), 14) },
    { label: "3pm", transactions: 8, date: new Date(year, month, today.getDate(), 15) },
    { label: "4pm", transactions: 6, date: new Date(year, month, today.getDate(), 16) },
    { label: "5pm", transactions: 3, date: new Date(year, month, today.getDate(), 17) },
  ],
  week: [
    { label: "Mon", transactions: 42, date: new Date(year, month, today.getDate() - ((today.getDay() + 6) % 7)) },
    { label: "Tue", transactions: 35, date: new Date(year, month, today.getDate() - ((today.getDay() + 5) % 7)) },
    { label: "Wed", transactions: 48, date: new Date(year, month, today.getDate() - ((today.getDay() + 4) % 7)) },
    { label: "Thu", transactions: 56, date: new Date(year, month, today.getDate() - ((today.getDay() + 3) % 7)) },
    { label: "Fri", transactions: 63, date: new Date(year, month, today.getDate() - ((today.getDay() + 2) % 7)) },
    { label: "Sat", transactions: 78, date: new Date(year, month, today.getDate() - ((today.getDay() + 1) % 7)) },
    { label: "Sun", transactions: 24, date: new Date(year, month, today.getDate() - ((today.getDay() + 0) % 7)) },
  ],
  month: [
    { label: "Week 1", transactions: 165, date: new Date(year, month, 1) },
    { label: "Week 2", transactions: 182, date: new Date(year, month, 8) },
    { label: "Week 3", transactions: 210, date: new Date(year, month, 15) },
    { label: "Week 4", transactions: 158, date: new Date(year, month, 22) },
  ],
  year: [
    { label: "Jan", transactions: 620, date: new Date(year, 0, 1) },
    { label: "Feb", transactions: 545, date: new Date(year, 1, 1) },
    { label: "Mar", transactions: 710, date: new Date(year, 2, 1) },
    { label: "Apr", transactions: 665, date: new Date(year, 3, 1) },
    { label: "May", transactions: 780, date: new Date(year, 4, 1) },
    { label: "Jun", transactions: 720, date: new Date(year, 5, 1) },
    { label: "Jul", transactions: 830, date: new Date(year, 6, 1) },
    { label: "Aug", transactions: 745, date: new Date(year, 7, 1) },
    { label: "Sep", transactions: 860, date: new Date(year, 8, 1) },
    { label: "Oct", transactions: 805, date: new Date(year, 9, 1) },
    { label: "Nov", transactions: 910, date: new Date(year, 10, 1) },
    { label: "Dec", transactions: 1050, date: new Date(year, 11, 1) },
  ],
};

const salesChartConfig = {
  sales: {
    label: "Sales (KES)",
    color: "var(--chart-1)",
  },
};

const transactionsChartConfig = {
  transactions: {
    label: "Transactions",
    color: "var(--chart-2)",
  },
};

const chartDescriptions = {
  today: "Hourly",
  week: "Daily",
  month: "Weekly",
  year: "Monthly",
};

const recentActivity = [
  { customer: "James Mwangi", amount: "KES 4,500", items: 3, time: "12 min ago", status: "completed" },
  { customer: "Sarah Wanjiku", amount: "KES 2,800", items: 2, time: "28 min ago", status: "completed" },
  { customer: "Peter Otieno", amount: "KES 7,200", items: 5, time: "45 min ago", status: "completed" },
  { customer: "Mary Njeri", amount: "KES 1,350", items: 1, time: "1 hr ago", status: "completed" },
  { customer: "David Kipchoge", amount: "KES 5,600", items: 4, time: "1 hr ago", status: "refunded" },
];

const SalesChart = memo(function SalesChart({ data, timeFilter }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Overview</CardTitle>
        <CardDescription>{chartDescriptions[timeFilter]} sales</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={salesChartConfig} className="h-[250px] w-full">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
})

const TransactionsChart = memo(function TransactionsChart({ data, timeFilter }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transactions Overview</CardTitle>
        <CardDescription>
          {chartDescriptions[timeFilter]} transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={transactionsChartConfig}
          className="h-[250px] w-full"
        >
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="transactions"
              fill="var(--color-transactions)"
              fillOpacity={0.2}
              stroke="var(--color-transactions)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
})

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState("today");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    }
    if (calendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const filteredSalesData = useMemo(() => {
    const data = salesData[timeFilter];
    if (!dateRange.from || !dateRange.to) return data;
    return data.filter((d) => d.date >= dateRange.from && d.date <= dateRange.to);
  }, [timeFilter, dateRange]);

  const filteredTransactionsData = useMemo(() => {
    const data = transactionsData[timeFilter];
    if (!dateRange.from || !dateRange.to) return data;
    return data.filter((d) => d.date >= dateRange.from && d.date <= dateRange.to);
  }, [timeFilter, dateRange]);

  const statCards = useMemo(() => {
    const salesMap = {
      today: { value: "KES 168,500", description: "22 items sold today" },
      week: { value: "KES 1,014,000", description: "346 items sold this week" },
      month: { value: "KES 2,098,000", description: "1,284 items sold this month" },
      year: { value: "KES 25,400,000", description: "15,420 items sold this year" },
    }
    const txMap = {
      today: { value: "63", description: "Last sale 12 min ago" },
      week: { value: "346", description: "Avg 49 per day" },
      month: { value: "1,284", description: "Avg 43 per day" },
      year: { value: "8,640", description: "Avg 24 per day" },
    }
    return [
      {
        title: timeFilter === "today" ? "Today's Sales" : "Total Sales",
        value: salesMap[timeFilter].value,
        description: salesMap[timeFilter].description,
        icon: DollarSignIcon,
      },
      {
        title: timeFilter === "today" ? "Transactions" : "Total Transactions",
        value: txMap[timeFilter].value,
        description: txMap[timeFilter].description,
        icon: ShoppingCartIcon,
      },
      {
        title: "Low Stock Items",
        value: "3",
        description: "2 items below reorder level",
        icon: AlertTriangleIcon,
      },
      {
        title: "Customers",
        value: "1,247",
        description: "12 new this week",
        icon: UsersIcon,
      },
    ]
  }, [timeFilter])

  return (
    <div className="space-y-6 p-6">
      {/* Top row: Greeting + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {user?.display_name || user?.username}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              size="sm"
              disabled={action.disabled}
              className="gap-1.5"
            >
              <action.icon className="size-4" />
              <span className="hidden lg:inline">{action.title}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Time Filters */}
      <div className="flex items-center gap-1">
        {timeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={timeFilter === filter.value ? "default" : "ghost"}
            size="sm"
            onClick={() => { setTimeFilter(filter.value); setDateRange({ from: undefined, to: undefined }); }}
          >
            {filter.label}
          </Button>
        ))}
        <div className="relative" ref={calendarRef}>
          <Button
            variant={dateRange.from ? "default" : "outline"}
            size="icon-sm"
            className="ml-1"
            onClick={() => setCalendarOpen(!calendarOpen)}
          >
            <CalendarIcon className="size-4" />
          </Button>
          {calendarOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 rounded-lg border bg-popover p-2 shadow-md">
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
                      setDateRange({ from: undefined, to: undefined });
                      setCalendarOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesChart data={filteredSalesData} timeFilter={timeFilter} />
        <TransactionsChart data={filteredTransactionsData} timeFilter={timeFilter} />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentActivity.map((sale, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {sale.customer.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sale.customer}</p>
                      <p className="text-xs text-muted-foreground">{sale.items} items &middot; {sale.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{sale.amount}</span>
                    <Badge variant={sale.status === "refunded" ? "destructive" : "secondary"} className="text-[10px]">
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div>
            <p className="font-semibold text-foreground">RYANTECH SOLUTIONS LTD.</p>
            <p>Ground Floor, Luther Plaza, Nyerere Road, Nairobi, Kenya.</p>
          </div>
          <div className="text-center sm:text-right">
            <p>WhatsApp/Call: +254 720 475 664</p>
            <p>
              <a href="https://www.ryantech.co.ke" className="hover:text-foreground underline underline-offset-2">www.ryantech.co.ke</a>
              {" "}|{" "}
              <a href="mailto:info@ryantech.co.ke" className="hover:text-foreground underline underline-offset-2">info@ryantech.co.ke</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
