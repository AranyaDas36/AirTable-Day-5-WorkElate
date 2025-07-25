"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "../lib/utils.js" 
import React from "react"

let nextId = 0
const generateId = () => `id_${nextId++}`

function CustomDialog({ open, onOpenChange, title, children, footer }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            &times;
          </button>
        </div>
        <div className="py-4">{children}</div>
        {footer && <div className="flex justify-end pt-4">{footer}</div>}
      </div>
    </div>
  )
}

"use client"


function CustomPopover({ trigger, content }) {
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
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 bg-white border rounded shadow-md">
          {content}
        </div>
      )}
    </div>
  )
}



export default function TableEditor() {
  const [columns, setColumns] = useState([{ id: generateId(), name: "Column 1" }])
  const [rows, setRows] = useState([
    { id: generateId(), [columns[0].id]: { value: "Entry 1", textColor: "", bgColor: "" } },
  ])

  const [editingCell, setEditingCell] = useState(null)
  const [cellValue, setCellValue] = useState("")

  const [selectedCells, setSelectedCells] = useState(new Set())
  const [selectedTextColor, setSelectedTextColor] = useState("#000000")
  const [selectedBgColor, setSelectedBgColor] = useState("#ffffff")

  const addColumn = useCallback(() => {
    const newColId = generateId()
    const newColName = `Column ${columns.length + 1}`
    setColumns((prevCols) => [...prevCols, { id: newColId, name: newColName }])
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        [newColId]: { value: "", textColor: "", bgColor: "" },
      })),
    )
  }, [columns.length])

  const addRow = useCallback(() => {
    const newRowId = generateId()
    const newRow = { id: newRowId }
    columns.forEach((col) => {
      newRow[col.id] = { value: "", textColor: "", bgColor: "" }
    })
    setRows((prevRows) => [...prevRows, newRow])
  }, [columns])

  const handleCellClick = useCallback(
    (rowId, colId) => {
      setEditingCell({ rowId, colId })
      const row = rows.find((r) => r.id === rowId)
      if (row) {
        setCellValue(row[colId]?.value || "")
      }

      const cellKey = `${rowId}_${colId}`
      setSelectedCells((prevSelected) => {
        const newSelected = new Set(prevSelected)
        if (newSelected.has(cellKey)) {
          newSelected.delete(cellKey)
        } else {
          newSelected.add(cellKey)
        }
        return newSelected
      })
    },
    [rows],
  )

  const handleRowHeaderClick = useCallback(
    (rowId) => {
      setSelectedCells((prevSelected) => {
        const newSelected = new Set(prevSelected)
        const rowCellsKeys = columns.map((col) => `${rowId}_${col.id}`)
        const isRowSelected = rowCellsKeys.every((key) => newSelected.has(key))

        if (isRowSelected) {
          rowCellsKeys.forEach((key) => newSelected.delete(key))
        } else {
          rowCellsKeys.forEach((key) => newSelected.add(key))
        }
        return newSelected
      })
    },
    [columns],
  )

  const handleColumnHeaderClick = useCallback(
    (colId) => {
      setSelectedCells((prevSelected) => {
        const newSelected = new Set(prevSelected)
        const colCellsKeys = rows.map((row) => `${row.id}_${colId}`)
        const isColSelected = colCellsKeys.every((key) => newSelected.has(key))

        if (isColSelected) {
          colCellsKeys.forEach((key) => newSelected.delete(key))
        } else {
          colCellsKeys.forEach((key) => newSelected.add(key))
        }
        return newSelected
      })
    },
    [rows],
  )

  const handleCellValueChange = useCallback((e) => {
    setCellValue(e.target.value)
  }, [])

  const saveCellValue = useCallback(() => {
    if (editingCell) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === editingCell.rowId
            ? {
                ...row,
                [editingCell.colId]: { ...row[editingCell.colId], value: cellValue },
              }
            : row,
        ),
      )
      setEditingCell(null)
    }
  }, [editingCell, cellValue])

  const applyColors = useCallback(() => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        const newRow = { ...row }
        columns.forEach((col) => {
          const cellKey = `${row.id}_${col.id}`
          if (selectedCells.has(cellKey)) {
            newRow[col.id] = {
              ...newRow[col.id],
              textColor: selectedTextColor,
              bgColor: selectedBgColor,
            }
          }
        })
        return newRow
      }),
    )
  }, [selectedCells, selectedTextColor, selectedBgColor, columns])

  const clearSelection = useCallback(() => {
    setSelectedCells(new Set())
  }, [])

  const handleColumnNameChange = useCallback((colId, newName) => {
    setColumns((prevCols) => prevCols.map((col) => (col.id === colId ? { ...col, name: newName } : col)))
  }, [])

  return (
    <div className="container mx-auto p-4 2">
      <h1 className="text-4xl font-bold mb-4 flex justify-center">Table Editor</h1>

      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        <button
          onClick={addRow}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
        >
          Add Row
        </button>
        <button
          onClick={addColumn}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
        >
          Add Column
        </button>
        <CustomPopover
          trigger={
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Apply Colors
            </button>
          }
          content={
            <div className="w-auto p-4 flex flex-col space-y-2">
              <label
                htmlFor="text-color"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Text Color
              </label>
              <input
                id="text-color"
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <label
                htmlFor="bg-color"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Background Color
              </label>
              <input
                id="bg-color"
                type="color"
                value={selectedBgColor}
                onChange={(e) => setSelectedBgColor(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={applyColors}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
              >
                Apply to Selected
              </button>
            </div>
          }
        />
        <button
          variant="outline"
          onClick={clearSelection}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Clear Selection
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border text-left bg-blue-100 w-12"></th>
              {columns.map((col) => (
                   <th
                key={col.id}
                className="p-2 border text-left bg-blue-100 cursor-pointer hover:bg-blue-200"
                onClick={(e) => {
                    if (e.target.tagName !== "INPUT") {
                    handleColumnHeaderClick(col.id)
                    }
                }}
                >
                <input
                    value={col.name}
                    onChange={(e) => handleColumnNameChange(col.id, e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 font-semibold"
                />
                </th>

              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id}>
                <td
                  className="p-2 border text-center bg-blue-100 cursor-pointer hover:bg-blue-200 font-semibold"
                  onClick={() => handleRowHeaderClick(row.id)}
                >
                  {rowIndex + 1}
                </td>
                {columns.map((col) => {
                  const cellData = row[col.id] || { value: "", textColor: "", bgColor: "" }
                  const isSelected = selectedCells.has(`${row.id}_${col.id}`)
                  return (
                    <td
                      key={`${row.id}-${col.id}`}
                      className={cn("p-2 border relative group bg-blue-100", isSelected && "ring-2 ring-blue-500 ring-offset-1")}
                      style={{
                        color: cellData.textColor || "inherit",
                        backgroundColor: cellData.bgColor || "transparent",
                      }}
                      onClick={() => handleCellClick(row.id, col.id)}
                    >
                      {cellData.value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CustomDialog
        open={!!editingCell}
        onOpenChange={() => setEditingCell(null)}
        title="Edit Cell"
        footer={
          <button
            type="submit"
            onClick={saveCellValue}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-black/90 h-10 px-4 py-2"
          >
            Save changes
          </button>
        }
      >
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label
              htmlFor="cell-value"
              className="text-right text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Value
            </label>
            <input
              id="cell-value"
              value={cellValue}
              onChange={handleCellValueChange}
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </CustomDialog>
    </div>
  )
}
