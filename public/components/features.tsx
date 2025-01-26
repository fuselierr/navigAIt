import { CheckCircle } from "lucide-react"

export default function Features() {
  const features = [
    "AI-powered onboarding assistance",
    "Customizable workflows",
    "Real-time progress tracking",
    "Seamless integration with existing systems",
    "Multi-language support",
    "Analytics and reporting",
  ]

  return (
    <div className="mt-12 bg-[#1A1744] p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#87CEEB] mb-6">Why Choose navigAIt?</h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-white">
            <CheckCircle className="h-6 w-6 flex-shrink-0 text-[#87CEEB] mr-3" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

