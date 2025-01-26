"use client"

import { useEffect, useRef, useState } from "react"

export function Transcript({ words }) {
  const [displayedWords, setDisplayedWords] = useState([])
  const transcriptRef = useRef(null)

  useEffect(() => {
    let currentIndex = 0
    const intervalId = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedWords((prev) => [...prev, words[currentIndex]])
        currentIndex++
      } else {
        clearInterval(intervalId)
      }
    }, 200) // Adjust typing speed here

    return () => clearInterval(intervalId)
  }, [words])

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcriptRef]) //Fixed unnecessary dependency

  return (
    <div ref={transcriptRef} style={styles.transcriptBox}>
      {displayedWords.join(" ")}
    </div>
  )
}

const styles = {
  transcriptBox: {
    width: "100%",
    height: "200px",
    overflowY: "auto",
    padding: "1rem",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    lineHeight: "1.5",
    fontSize: "1rem",
  },
}

