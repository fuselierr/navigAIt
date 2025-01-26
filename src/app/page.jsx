"use client"

import { useEffect, useRef } from "react"
import { Transcript } from "./Transcript"

export default function LandingPage() {
  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
  }

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.logo}>
          navig<strong style={styles.logoStrong}>AI</strong>t
        </div>
        <div style={styles.navLinks}>
          <a href="#product" style={styles.link}>
            Our Product
          </a>
          <a href="#pricing" style={styles.link}>
            Pricing
          </a>
          <a href="#stories" style={styles.link}>
            Client Stories
          </a>
          <button style={styles.contactButton}>Contact</button>
        </div>
      </nav>

      <main style={styles.main}>
        <h1 style={styles.title}>
          Elevate Your
          <br />
          Onboarding Process
        </h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" placeholder="Submit the task/instructions..." style={styles.input} />
          <div style={styles.buttonGroup}>
            <button style={styles.iconButton}>📎</button>
            <button style={styles.iconButton}>🎤</button>
            <button style={styles.submitButton}>Submit →</button>
          </div>
        </form>

        <section style={styles.transcriptSection}>
          <h2 style={styles.subtitle}>Transcript</h2>
          <Transcript
            words={[
              "Welcome",
              "to",
              "navigAlt!",
              "Our",
              "AI-powered",
              "onboarding",
              "assistant",
              "is",
              "here",
              "to",
              "help.",
              "We",
              "offer",
              "customizable",
              "workflows,",
              "real-time",
              "progress",
              "tracking,",
              "seamless",
              "integration",
              "with",
              "existing",
              "systems,",
              "multi-language",
              "support,",
              "and",
              "comprehensive",
              "analytics",
              "and",
              "reporting.",
              "Let",
              "us",
              "elevate",
              "your",
              "onboarding",
              "process",
              "to",
              "new",
              "heights!",
            ]}
          />
        </section>
      </main>

      <footer style={styles.footer}>
        Copyright © 2025 navigAlt. Headquarters: Waterloo, CAN. All rights reserved.
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#1a1a2e",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logo: {
    fontSize: "1.5rem",
    color: "#7dd3fc",
  },
  logoStrong: {
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
  },
  contactButton: {
    background: "#7dd3fc",
    color: "#1a1a2e",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "4rem 2rem",
  },
  title: {
    fontSize: "3.5rem",
    textAlign: "center",
    color: "#7dd3fc",
    marginBottom: "2rem",
  },
  form: {
    display: "flex",
    gap: "1rem",
    maxWidth: "600px",
    margin: "0 auto 4rem",
  },
  input: {
    flex: 1,
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
  },
  buttonGroup: {
    display: "flex",
    gap: "0.5rem",
  },
  iconButton: {
    padding: "0.75rem",
    borderRadius: "4px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    cursor: "pointer",
  },
  submitButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "4px",
    border: "none",
    background: "#7dd3fc",
    color: "#1a1a2e",
    cursor: "pointer",
  },
  transcriptSection: {
    marginTop: "4rem",
  },
  subtitle: {
    fontSize: "2rem",
    color: "#7dd3fc",
    marginBottom: "2rem",
  },
  footer: {
    textAlign: "center",
    padding: "2rem",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.7)",
  },
}

