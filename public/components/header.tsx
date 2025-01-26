import Link from "next/link"

export default function Header() {
  return (
    <header className="w-full bg-[#1A1744] text-white border-b border-[#87CEEB]">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-[#87CEEB]">
          navigAIt
        </Link>
        <ul className="flex space-x-6 items-center">
          <li>
            <Link href="/product" className="hover:text-[#87CEEB] transition-colors">
              Our Product
            </Link>
          </li>
          <li>
            <Link href="/pricing" className="hover:text-[#87CEEB] transition-colors">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="/stories" className="hover:text-[#87CEEB] transition-colors">
              Client Stories
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="bg-[#87CEEB] text-[#0D0B26] px-4 py-2 rounded-md hover:bg-[#5EAED6] transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

