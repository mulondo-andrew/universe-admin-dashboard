import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const userGrowthData = [
  { name: "Jan", users: 4000 },
  { name: "Feb", users: 5000 },
  { name: "Mar", users: 6500 },
  { name: "Apr", users: 8200 },
  { name: "May", users: 10500 },
  { name: "Jun", users: 12450 },
];

const roleDistributionData = [
  { name: "Students", value: 9500 },
  { name: "Faculty", value: 1200 },
  { name: "Staff", value: 800 },
  { name: "Admins", value: 50 },
];

// Google Colors: Blue, Green, Yellow, Red
const COLORS = ["#1a73e8", "#34a853", "#fbbc04", "#ea4335"];

const recentActivity = [
  {
    id: 1,
    user: "Sarah Jenkins",
    action: "Created new course CS101",
    time: "2 mins ago",
    type: "success"
  },
  {
    id: 2,
    user: "Mike Ross",
    action: "Updated building schedule",
    time: "1 hour ago",
    type: "info"
  },
  {
    id: 3,
    user: "System",
    action: "Automated backup completed",
    time: "3 hours ago",
    type: "neutral"
  },
  {
    id: 4,
    user: "Admin",
    action: "Approved 50 new student accounts",
    time: "5 hours ago",
    type: "success"
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 11550,
    activeStudents: 8432,
    serverHealth: "99.9",
    reportsPending: 42
  });

  useEffect(() => {
    const socket = io();

    socket.on('dashboard_stats', (data) => {
      setStats(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="bg-primary/10 border-primary/20 shadow-none">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-rounded text-primary text-[24px]">person_add</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Welcome to UniVerse!</h3>
              <p className="text-muted-foreground">Complete your profile to get the most out of the platform.</p>
            </div>
          </div>
          <Link to="/onboarding">
            <Button className="rounded-full px-6">Complete Profile</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-medium tracking-tight text-foreground font-heading">
            Command Center
          </h2>
          <p className="text-muted-foreground mt-1 text-[15px]">
            Real-time overview of the UniVerse platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-card rounded-full shadow-sm border-border text-primary hover:bg-muted hover:text-primary h-10 px-5 font-medium">
            <span className="material-symbols-rounded mr-2 text-[20px]">dns</span> System Status
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-none h-10 px-5 font-medium">
            <span className="material-symbols-rounded mr-2 text-[20px]">bolt</span> Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-primary text-[24px]">group</span>
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-rounded text-[16px] mr-1">trending_up</span>
                +12%
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[14px] font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-[32px] font-medium text-foreground mt-1 tracking-tight font-heading">{stats.totalUsers.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-emerald-600 dark:text-emerald-400 text-[24px]">school</span>
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-rounded text-[16px] mr-1">trending_up</span>
                +5%
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[14px] font-medium text-muted-foreground">Active Students</p>
              <h3 className="text-[32px] font-medium text-foreground mt-1 tracking-tight font-heading">{stats.activeStudents.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-amber-600 dark:text-amber-400 text-[24px]">warning</span>
              </div>
              <div className="flex items-center text-sm font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-rounded text-[16px] mr-1">trending_up</span>
                +8%
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[14px] font-medium text-muted-foreground">Reports Pending</p>
              <h3 className="text-[32px] font-medium text-foreground mt-1 tracking-tight font-heading">{stats.reportsPending}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-rounded text-primary text-[24px]">dns</span>
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <span className="material-symbols-rounded text-[16px] mr-1">check_circle</span>
                Stable
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[14px] font-medium text-muted-foreground">Server Health</p>
              <h3 className="text-[32px] font-medium text-foreground mt-1 tracking-tight font-heading">{stats.serverHealth}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="premium-card lg:col-span-4">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-[18px] font-medium flex items-center text-foreground font-heading">
              <span className="material-symbols-rounded mr-2 text-[22px] text-primary">monitoring</span> User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={13} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={13} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card lg:col-span-3">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-[18px] font-medium flex items-center text-foreground font-heading">
              <span className="material-symbols-rounded mr-2 text-[22px] text-emerald-500">pie_chart</span> Role Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="premium-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-[18px] font-medium text-foreground font-heading">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-5 flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "success"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : activity.type === "info"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="material-symbols-rounded text-[20px]">
                    {activity.type === "success" ? "check_circle" : activity.type === "info" ? "info" : "history"}
                  </span>
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-[15px] font-medium text-foreground">
                    {activity.user}
                  </p>
                  <p className="text-[14px] text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-[13px] font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <Button variant="ghost" className="w-full text-primary hover:text-primary/90 hover:bg-primary/10 font-medium rounded-full h-10">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
