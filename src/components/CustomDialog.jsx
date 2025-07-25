"use client"
import React from "react"
export default function CustomDialog({ open, onOpenChange, title, children, footer }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="py-4">{children}</div>
        {footer && <div className="flex justify-end pt-4">{footer}</div>}
      </div>
    </div>
  )
}
