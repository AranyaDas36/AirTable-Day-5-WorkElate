import "./index.css" // Ensure your Tailwind CSS is imported
import React from "react"
import TableEditor from "./components/TableEditor"

function App() {
  return (
    <div className="App">
      <div className="h-screen bg-gradient-to-b from-white to-blue-200">
          <TableEditor />
      </div>
    </div>
  )
}

export default App
