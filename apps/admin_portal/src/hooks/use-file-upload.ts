import { useState, useRef } from "react";

export function useFileUpload(sampleHeaders?: string[]) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileDescription, setFileDescription] = useState("");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
const OPTIONAL_HEADERS = ["preference", "speciality", "futureref1", "futureref2"];

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file select via input
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("This is file:",file);
    setSelectedFile(file);
    setError("");
  };

  // Handle drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
    setError("");
  };

  // Parse first row (headers) of CSV
  const parseCSVHeaders = async (file: File) => {
    const text = await file.text();
    const firstLine = text.split("\n")[0] || "";
    const headers = firstLine
      .split(",")
      .map((h) => h.replace(/\r/g, "").trim());
    return headers;
  };

  // Normalize headers (remove \r, lowercase, trim)
const clean = (h: string) =>
  h
    .replace(/\r/g, '')   // remove carriage return
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, ''); 
    console.log("this is clean", clean);
    

  // Validate CSV headers
  const validateCSV = async () => {
    if (!selectedFile) {
      return { valid: false, error: "Please select a CSV file" };
    }

    if (sampleHeaders && sampleHeaders.length > 0) {
      const headers = await parseCSVHeaders(selectedFile);
      const lowerHeaders = headers.map(clean);
      const lowerSample = sampleHeaders.map(clean);

      // const missing = lowerSample.filter((h) => !lowerHeaders.includes(h));

     const missing = lowerSample.filter(
  (h) => !OPTIONAL_HEADERS.includes(h) && !lowerHeaders.includes(h)
);
      const extra = lowerHeaders.filter((h) => !lowerSample.includes(h));

      if (missing.length > 0 || extra.length > 0) {
        return {
          valid: false,
          error: `CSV header mismatch.\nMissing: ${
            missing.length ? missing.join(", ") : "None"
          }\nExtra: ${extra.length ? extra.join(", ") : "None"}`,
        };
      }
    }

    return { valid: true, error: "" };
  };

  // Step navigation (if you need it, like in catalog upload wizard)
  const handleNextStep = () => {
    if (!fileName.trim()) {
      setError("File name is required");
      return;
    }
    if (!fileDescription.trim()) {
      setError("File description is required");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    setError("");
  };

  // Reset all states
  const resetForm = () => {
    setSelectedFile(null);
    setFileName("");
    setFileDescription("");
    setError("");
    setCurrentStep(1);
  };

  return {
    selectedFile,
    fileName,
    fileDescription,
    error,
    currentStep,
    fileInputRef,

    setSelectedFile,
    setFileName,
    setFileDescription,
    setError,
    setCurrentStep,

    handleFileSelect,
    handleDrop,
    handleNextStep,
    handlePreviousStep,
    validateCSV,
    resetForm,
  };
}
