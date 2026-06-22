import Foundation
import PDFKit

func extractText(from url: URL) {
    guard let pdf = PDFDocument(url: url) else {
        print("Error: Could not load PDF at \(url.path)")
        return
    }
    
    print("--- START PDF TEXT ---")
    for i in 0..<pdf.pageCount {
        if let page = pdf.page(at: i), let text = page.string {
            print("=== PAGE \(i+1) ===")
            print(text)
        }
    }
    print("--- END PDF TEXT ---")
}

let arguments = CommandLine.arguments
if arguments.count < 2 {
    print("Usage: swift read_pdf.swift <path_to_pdf>")
    exit(1)
}

let path = arguments[1]
let fileURL = URL(fileURLWithPath: path)
extractText(from: fileURL)
