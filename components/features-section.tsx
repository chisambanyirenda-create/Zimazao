import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Camera, BarChart3, Wallet, ArrowRight } from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: ShoppingBag,
    title: "Crop Marketplace",
    description: "List and sell your maize, groundnuts, soybeans, cassava, and other crops directly to verified buyers.",
    link: "/marketplace",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Camera,
    title: "Disease Detection",
    description: "Upload photos of your crops to get instant AI-powered diagnosis and treatment recommendations.",
    link: "/disease-detector",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Live Market Prices",
    description: "Stay updated with real-time commodity prices from markets across Zambia to maximize your profits.",
    link: "/prices",
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description: "Receive payments safely through mobile money integration with MTN, Airtel, and Zamtel.",
    link: "/payments",
    color: "text-secondary-foreground",
    bgColor: "bg-secondary",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Grow Your Farm Business
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Zimazao provides Zambian farmers with powerful tools to sell crops, protect harvests, and increase profits.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${feature.bgColor} rounded-2xl flex items-center justify-center`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <span className="inline-flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
