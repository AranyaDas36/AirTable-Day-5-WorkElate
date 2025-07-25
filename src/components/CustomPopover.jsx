// components/CustomPopover.js
"use client"

import { useState, useEffect, useRef } from "react"
import React from "react"

export default function CustomPopover({ trigger, content }) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef(null)

  const toggleOpen = () => setIsOpen((prev) => !prev)
  const closePopover = () => setIsOpen(false)

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        closePopover()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={toggleOpen}>{trigger}</div>
      {isOpen && React.cloneElement(content(closePopover))}
    </div>
  )
}
