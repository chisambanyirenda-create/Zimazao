import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, ShoppingBag, Shield } from "lucide-react"

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Active Farmers",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: ShoppingBag,
    value: "50,000+",
    label: "Crops Sold",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: TrendingUp,
    value: "K5M+",
    label: "Total Sales",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    icon: Shield,
    value: "99%",
    label: "Secure Transactions",
    color: "text-secondary-foreground",
    bgColor: "bg-secondary",
  },
]

export function StatsSection() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
