import {
  DollarSignIcon,
  ShoppingCartIcon,
  AlertTriangleIcon,
  UsersIcon,
  PlusCircleIcon,
  PackageIcon,
  TruckIcon,
} from "lucide-react";

// --- Utilities ---

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// --- Config ---

export const timeFilters = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export const quickActions = {
  primary: { title: "New Sale", icon: PlusCircleIcon, route: "/sales/new", disabled: true },
  secondary: [
    { title: "Add Product", icon: PackageIcon, route: "/products/new", disabled: true },
    { title: "Receive Stock", icon: TruckIcon, route: "/stock/receive", disabled: true },
  ],
};

export const salesChartConfig = {
  sales: { label: "Sales (KES)", color: "var(--chart-1)" },
};

export const transactionsChartConfig = {
  transactions: { label: "Transactions", color: "var(--chart-2)" },
};

export const chartDescriptions = {
  today: "Hourly",
  week: "Daily",
  month: "Weekly",
  year: "Monthly",
};

// --- Stat card maps ---

export const salesMap = {
  today: { value: "KES 168,500", description: "22 items sold today" },
  week: { value: "KES 1,014,000", description: "346 items sold this week" },
  month: { value: "KES 2,098,000", description: "1,284 items sold this month" },
  year: { value: "KES 25,400,000", description: "15,420 items sold this year" },
};

export const txMap = {
  today: { value: "63", description: "Last sale 12 min ago" },
  week: { value: "346", description: "Avg 49 per day" },
  month: { value: "1,284", description: "Avg 43 per day" },
  year: { value: "8,640", description: "Avg 24 per day" },
};

export const statIcons = {
  sales: DollarSignIcon,
  transactions: ShoppingCartIcon,
  lowStock: AlertTriangleIcon,
  customers: UsersIcon,
};

// --- Dummy chart data ---

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();

export const salesData = {
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

export const transactionsData = {
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

// --- Dummy recent activity ---

export const recentActivity = [
  { customer: "James Mwangi", amount: "KES 4,500", items: 3, time: "12 min ago", status: "completed" },
  { customer: "Sarah Wanjiku", amount: "KES 2,800", items: 2, time: "28 min ago", status: "completed" },
  { customer: "Peter Otieno", amount: "KES 7,200", items: 5, time: "45 min ago", status: "completed" },
  { customer: "Mary Njeri", amount: "KES 1,350", items: 1, time: "1 hr ago", status: "completed" },
  { customer: "David Kipchoge", amount: "KES 5,600", items: 4, time: "1 hr ago", status: "refunded" },
];
