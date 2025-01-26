"use client";

import { useState } from "react";
import { FileUp, Mic, X, Play } from "lucide-react";

export default function InputBox() {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isActive) return; 

    setIsActive(true);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    console.log("Play functionality triggered");
  };

  const handleReset = () => {
    setIsActive(false);
    setIsProcessing(false);
    setInput("");
    setFile(null);
    setIsListening(false);
  };

  const handleMicClick = () => {
    setIsListening(!isListening);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Submit the task/instructions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-2 bg-[#3B3470] text-white placeholder-[#87CEEB] border border-[#87CEEB] rounded-md focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
          disabled={isActive}
        />
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          disabled={isActive}
        />
        <label htmlFor="file-upload">
          <div
            className="cursor-pointer p-2 bg-[#3B3470] text-[#87CEEB] hover:bg-[#4B4480] border border-[#87CEEB] rounded-md flex items-center justify-center"
            disabled={isActive}
          >
            <FileUp className="h-4 w-4" />
          </div>
        </label>
        <div
          className={`cursor-pointer p-2 bg-[#3B3470] text-[#87CEEB] hover:bg-[#4B4480] border border-[#87CEEB] rounded-md flex items-center justify-center ${isListening ? "text-red-500" : ""}`}
          onClick={handleMicClick}
          disabled={isActive}
        >
          <Mic className="h-4 w-4" />
        </div>
        {isActive ? (
          <div
            onClick={handleReset}
            className="cursor-pointer p-2 bg-[#87CEEB] text-[#0D0B26] font-semibold hover:bg-[#5EAED6] transition-colors rounded-md flex items-center"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </div>
        ) : (
          <button
            type="submit"
            className="p-2 bg-[#87CEEB] hover:bg-[#5EAED6] text-[#0D0B26] font-semibold transition-colors rounded-md flex items-center"
          >
            Submit
            <Play className="h-4 w-4 ml-2" />
          </button>
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
  );
}
