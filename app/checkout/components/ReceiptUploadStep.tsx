"use client";

import { useState, FC } from "react";
import { motion } from "framer-motion";
import { UploadCloud, File, X } from "lucide-react";

interface ReceiptUploadStepProps {
  handlePrevStep: () => void;
  handleReceiptUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const ReceiptUploadStep: FC<ReceiptUploadStepProps> = ({
  handlePrevStep,
  handleReceiptUpload,
  isUploading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Please upload a file smaller than 5MB.");
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setError("Invalid file type. Please upload a JPG, PNG, or PDF.");
        return;
      }
      setError(null);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    const input = document.getElementById('receipt-upload') as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      handleReceiptUpload(selectedFile);
    } else {
      setError("Please select a file to upload.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Upload Payment Receipt
      </h2>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            id="receipt-upload"
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, application/pdf"
          />
          {!selectedFile ? (
            <label
              htmlFor="receipt-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <UploadCloud className="w-12 h-12 text-gray-400" />
              <span className="font-semibold text-blue-600">Click to upload</span>
              <p className="text-sm text-gray-500">
                PNG, JPG, or PDF (max 5MB)
              </p>
            </label>
          ) : (
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    {selectedFile.type.startsWith('image/') ? (
                        <img src={previewUrl!} alt="Receipt preview" className="max-h-40 rounded-lg" />
                    ) : (
                        <div className="flex items-center space-x-2 p-4 bg-gray-100 rounded-lg">
                            <File className="w-8 h-8 text-gray-500" />
                            <span className="font-semibold">{selectedFile.name}</span>
                        </div>
                    )}
                    <button onClick={handleRemoveFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
          )}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={handlePrevStep}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          disabled={isUploading}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Uploading..." : "Confirm & Place Order"}
        </button>
      </div>
    </motion.div>
  );
};

export default ReceiptUploadStep;
