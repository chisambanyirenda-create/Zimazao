"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Eye,
  Plus,
  DollarSign,
  Package,
  MessageSquare,
  ArrowRight,
  Leaf,
} from "lucide-react"

const stats = [
  {
    title: "Total Sales",
    value: "K12,450",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Active Listings",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Package,
  },
  {
    title: "Profile Views",
    value: "234",
    change: "-5%",
    trend: "down",
    icon: Eye,
  },
  {
    title: "Messages",
    value: "12",
    change: "+3",
    trend: "up",
    icon: MessageSquare,
  },
]

const recentListings = [
  {
    id: 1,
    name: "White Maize",
    price: 450,
    unit: "50kg bag",
    quantity: "200 bags",
    status: "active",
    views: 45,
  },
  {
    id: 2,
    name: "Groundnuts",
    price: 380,
    unit: "25kg bag",
    quantity: "100 bags",
    status: "active",
    views: 32,
  },
  {
    id: 3,
    name: "Soybeans",
    price: 520,
    unit: "50kg bag",
    quantity: "150 bags",
    status: "sold",
    views: 78,
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    buyer: "ABC Trading Ltd",
    crop: "White Maize",
    quantity: "50 bags",
    total: 22500,
    status: "pending",
  },
  {
    id: "ORD-002",
    buyer: "Lusaka Millers",
    crop: "Groundnuts",
    quantity: "30 bags",
    total: 11400,
    status: "completed",
  },
]

function DashboardContent() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Please Sign In</h2>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to access your dashboard
            </p>
            <Link href="/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your farm business today
            </p>
          </div>
          <Link href="/new-listing">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add New Listing
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className={`${
                      stat.trend === "up"
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Listings */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Listings</CardTitle>
              <Link href="/my-listings" className="text-primary text-sm hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{listing.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {listing.quantity} • K{listing.price}/{listing.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={listing.status === "active" ? "default" : "secondary"}
                        className={
                          listing.status === "active"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {listing.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {listing.views} views
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 border border-border rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-mono text-muted-foreground">
                        {order.id}
                      </span>
                      <Badge
                        variant={order.status === "completed" ? "default" : "secondary"}
                        className={
                          order.status === "completed"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/20 text-accent-foreground"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground">{order.crop}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.quantity} • {order.buyer}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      K{order.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/new-listing">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">New Listing</span>
                </Button>
              </Link>
              <Link href="/disease-detector">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm">Scan Crops</span>
                </Button>
              </Link>
              <Link href="/prices">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">View Prices</span>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Messages</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
