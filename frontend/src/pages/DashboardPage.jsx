import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart } from "recharts";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  getGreeting,
  timeFilters,
  quickActions,
  salesChartConfig,
  transactionsChartConfig,
  chartDescriptions,
  salesMap,
  txMap,
  statIcons,
  salesData,
  transactionsData,
  recentActivity,
} from "@/data/dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState("today");
  const [chartView, setChartView] = useState("sales");
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

  const statCards = useMemo(() => [
    {
      title: timeFilter === "today" ? "Today's Sales" : "Total Sales",
      value: salesMap[timeFilter].value,
      description: salesMap[timeFilter].description,
      icon: statIcons.sales,
    },
    {
      title: timeFilter === "today" ? "Transactions" : "Total Transactions",
      value: txMap[timeFilter].value,
      description: txMap[timeFilter].description,
      icon: statIcons.transactions,
    },
    {
      title: "Low Stock Items",
      value: "3",
      description: "2 items below reorder level",
      icon: statIcons.lowStock,
    },
    {
      title: "Customers",
      value: "1,247",
      description: "12 new this week",
      icon: statIcons.customers,
    },
  ], [timeFilter]);

  const chartConfig = chartView === "sales" ? salesChartConfig : transactionsChartConfig;
  const chartData = chartView === "sales" ? filteredSalesData : filteredTransactionsData;
  const chartDescription = chartView === "sales"
    ? `${chartDescriptions[timeFilter]} sales`
    : `${chartDescriptions[timeFilter]} transactions`;

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

        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={quickActions.primary.disabled}
            className="gap-1.5 rounded-r-none"
          >
            <quickActions.primary.icon className="size-4" />
            <span className="hidden lg:inline">{quickActions.primary.title}</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-l-none border-l-0 px-2" disabled>
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {quickActions.secondary.map((action) => (
                <DropdownMenuItem key={action.title} disabled={action.disabled}>
                  <action.icon className="size-4" />
                  {action.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />

      {/* Time Filters */}
      <div className="flex items-center gap-1">
        {timeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={dateRange.from ? "ghost" : timeFilter === filter.value ? "default" : "ghost"}
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

      {/* Chart + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Overview</CardTitle>
              <p className="text-xs text-muted-foreground">{chartDescription}</p>
            </div>
            <div className="flex rounded-lg border p-0.5">
              <Button
                variant={chartView === "sales" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setChartView("sales")}
              >
                Sales
              </Button>
              <Button
                variant={chartView === "transactions" ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setChartView("transactions")}
              >
                Transactions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              {chartView === "sales" ? (
                <BarChart data={chartData} accessibilityLayer>
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
              ) : (
                <AreaChart data={chartData} accessibilityLayer>
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
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
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
