import Header from "./components/header"
import Logo from "./components/logo"
import InputBox from "./components/input-box"
import Features from "./components/features"
import Footer from "./components/footer"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0D0B26]">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-24 two-tone-bg">
        <Logo />
        <InputBox />
        <Features />
      </main>
      <Footer />
    </div>
  )
}

