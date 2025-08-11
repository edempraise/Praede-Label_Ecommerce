"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import ProductForm, { ProductFormData } from "./ProductForm";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductModal = ({
  isOpen,
  onClose,
  onProductAdded,
}: AddProductModalProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const uploadImages = async (images: (File | string)[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      if (typeof image === "string") {
        return image;
      }
      const fileName = `${Date.now()}-${image.name}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, image, { upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSaving(true);

    try {
      if (!formData.name || !formData.description || formData.price <= 0) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const imageUrls =
        formData.images.length > 0 ? await uploadImages(formData.images) : [];

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price,
        category: formData.category,
        size: formData.size.filter((s) => s.trim() !== ""),
        color: formData.color.filter((c) => c.trim() !== ""),
        images: imageUrls,
        quantity: formData.quantity,
        delivery_options: formData.delivery_options,
        featured: false,
      };

      const { error } = await supabase.from("products").insert(productData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Product "${formData.name}" added successfully.`,
      });

      onProductAdded();
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pt-4 pb-20 sm:pb-0">
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
            >
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="text-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Product
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Add a new product to your store
                    </p>
                  </div>
                  <ProductForm onSubmit={handleSubmit} isSaving={isSaving} />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
