"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileUp, Mic, X, Play } from "lucide-react"

export default function InputBox() {
  const [input, setInput] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isActive) return // Prevent re-submission while active

    setIsActive(true)
    setIsProcessing(true)
    // Simulating an async operation
    setTimeout(() => {
      setIsProcessing(false)
    }, 3000)

    // Add play functionality here
    console.log("Play functionality triggered")
  }

  const handleReset = () => {
    setIsActive(false)
    setIsProcessing(false)
    setInput("")
    setFile(null)
    setIsListening(false)
  }

  const handleMicClick = () => {
    setIsListening(!isListening)
    // Here you would typically implement actual speech recognition
    // For this example, we'll just toggle the state
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Submit the task/instructions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-[#3B3470] text-white placeholder-[#87CEEB] border-[#87CEEB]"
          disabled={isActive}
        />
        <Input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isActive}
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="cursor-pointer bg-[#3B3470] text-[#87CEEB] hover:bg-[#4B4480] border-[#87CEEB]"
            disabled={isActive}
          >
            <FileUp className="h-4 w-4" />
          </Button>
        </label>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="cursor-pointer bg-[#3B3470] text-[#87CEEB] hover:bg-[#4B4480] border-[#87CEEB]"
          onClick={handleMicClick}
          disabled={isActive}
        >
          <Mic className={`h-4 w-4 ${isListening ? "text-red-500" : ""}`} />
        </Button>
        {isActive ? (
          <Button
            type="button"
            onClick={handleReset}
            className="bg-[#87CEEB] text-[#0D0B26] font-semibold hover:bg-[#5EAED6] transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-[#87CEEB] hover:bg-[#5EAED6] text-[#0D0B26] font-semibold transition-colors flex items-center"
          >
            Submit
            <Play className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
      {file && <p className="mt-2 text-sm text-[#87CEEB]">File attached: {file.name}</p>}
      {isProcessing && (
        <div className="absolute inset-0 bg-[#3B3470] bg-opacity-50 flex items-center justify-center rounded-md">
          <div className="bg-[#1A1744] p-4 rounded-md flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#87CEEB]"></div>
            <p className="text-[#87CEEB]">Processing...</p>
          </div>
        </div>
      )}
    </form>
  )
}

