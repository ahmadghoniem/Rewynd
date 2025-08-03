import React from "react"
import { Button } from "./button"

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {currentPage > 1 ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Prev
        </Button>
      ) : (
        <span
          style={{ width: 64, display: "inline-block" }}
          aria-hidden="true"
        ></span>
      )}

      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i}
          size="sm"
          variant={currentPage === i + 1 ? "default" : "outline"}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </Button>
      ))}

      {currentPage < totalPages ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Next
        </Button>
      ) : (
        <span
          style={{ width: 64, display: "inline-block" }}
          aria-hidden="true"
        ></span>
      )}
    </div>
  )
}

export default Pagination
