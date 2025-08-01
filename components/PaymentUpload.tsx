"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, Check } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const PaymentUpload = ({ onFileUpload, isUploading }: PaymentUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setUploadedFile(file);
        onFileUpload(file);
      }
    },
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  // Destructure getRootProps to exclude conflicting drag handlers
  const { onDrag, onDragStart, onDragEnd, ...rootProps } = getRootProps();
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">
          Upload Payment Receipt
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Please upload a screenshot or photo of your payment receipt
        </p>

        {!uploadedFile ? (
          <div {...getRootProps()}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isDragActive
                  ? "Drop the receipt here..."
                  : "Drag & drop your receipt here, or click to select"}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: PNG, JPG, PDF (Max 10MB)
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check className="w-6 h-6 text-green-500" />
                )}
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentUpload;
