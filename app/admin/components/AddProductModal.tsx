"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Upload, Trash2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ProductFormData {
  name: string;
  description: string;
  originalPrice: number;
  discountPercentage: number;
  category: string;
  quantity: number;
  sizes: string[];
  colors: string[];
  images: File[];
  deliveryOptions: {
    lagosPickup: boolean;
    lagosDoor: boolean;
    outsidePickup: boolean;
    outsideDoor: boolean;
  };
}

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
  const [products, setProducts] = useState<ProductFormData[]>([
    {
      name: "",
      description: "",
      originalPrice: 0,
      discountPercentage: 0,
      category: "Clothing",
      quantity: 0,
      sizes: [""],
      colors: [""],
      images: [],
      deliveryOptions: {
        lagosPickup: false,
        lagosDoor: false,
        outsidePickup: false,
        outsideDoor: false,
      },
    },
  ]);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    multiple: true,
    onDrop: (acceptedFiles, rejectedFiles, event) => {
      if ("target" in event) {
        const productIndex = parseInt(
          (event.target as HTMLElement)
            ?.closest("[data-product-index]")
            ?.getAttribute("data-product-index") || "0"
        );

        setProducts((prev) =>
          prev.map((product, index) =>
            index === productIndex
              ? { ...product, images: [...product.images, ...acceptedFiles] }
              : product
          )
        );
      }
    },
  });

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        originalPrice: 0,
        discountPercentage: 0,
        category: "Clothing",
        quantity: 0,
        sizes: [""],
        colors: [""],
        images: [],
        deliveryOptions: {
          lagosPickup: false,
          lagosDoor: false,
          outsidePickup: false,
          outsideDoor: false,
        },
      },
    ]);
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      setProducts((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (
    index: number,
    field: keyof ProductFormData,
    value: any
  ) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === index ? { ...product, [field]: value } : product
      )
    );
  };

  const updateDeliveryOption = (
    productIndex: number,
    option: keyof ProductFormData["deliveryOptions"],
    value: boolean
  ) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === productIndex
          ? {
              ...product,
              deliveryOptions: { ...product.deliveryOptions, [option]: value },
            }
          : product
      )
    );
  };

  const addArrayItem = (productIndex: number, field: "sizes" | "colors") => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === productIndex
          ? { ...product, [field]: [...product[field], ""] }
          : product
      )
    );
  };

  const updateArrayItem = (
    productIndex: number,
    field: "sizes" | "colors",
    itemIndex: number,
    value: string
  ) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === productIndex
          ? {
              ...product,
              [field]: product[field].map((item, j) =>
                j === itemIndex ? value : item
              ),
            }
          : product
      )
    );
  };

  const removeArrayItem = (
    productIndex: number,
    field: "sizes" | "colors",
    itemIndex: number
  ) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === productIndex
          ? {
              ...product,
              [field]: product[field].filter((_, j) => j !== itemIndex),
            }
          : product
      )
    );
  };

  const removeImage = (productIndex: number, imageIndex: number) => {
    setProducts((prev) =>
      prev.map((product, i) =>
        i === productIndex
          ? {
              ...product,
              images: product.images.filter((_, j) => j !== imageIndex),
            }
          : product
      )
    );
  };

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      const fileName = `${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from("products")
        .upload(fileName, image, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
      .from("products")
      .getPublicUrl(fileName);

    return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      for (const product of products) {
        // Validate required fields
        if (
          !product.name ||
          !product.description ||
          product.originalPrice <= 0
        ) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields for each product.",
            variant: "destructive",
          });
          return;
        }

        // Upload images
        const imageUrls =
          product.images.length > 0 ? await uploadImages(product.images) : [];

        // Calculate discounted price
        const discountedPrice =
          product.originalPrice * (1 - product.discountPercentage / 100);

        // Prepare product data
        const productData = {
          name: product.name,
          description: product.description,
          price: Math.round(discountedPrice),
          original_price: product.originalPrice,
          category: product.category,
          size: product.sizes.filter((s) => s.trim() !== ""),
          color: product.colors.filter((c) => c.trim() !== ""),
          images: imageUrls,
          in_stock: product.quantity > 0,
          featured: false,
        };

        // Insert product
        const { error } = await supabase.from("products").insert(productData);

        if (error) throw error;
      }

      toast({
        title: "Success!",
        description: `${products.length} product(s) added successfully.`,
      });

      onProductAdded();
      onClose();

      // Reset form
      setProducts([
        {
          name: "",
          description: "",
          originalPrice: 0,
          discountPercentage: 0,
          category: "Clothing",
          quantity: 0,
          sizes: [""],
          colors: [""],
          images: [],
          deliveryOptions: {
            lagosPickup: false,
            lagosDoor: false,
            outsidePickup: false,
            outsideDoor: false,
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding products:", error);
      toast({
        title: "Error",
        description: "Failed to add products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40 pointer-events-auto"
              onClick={onClose}
            />
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

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
              className="z-50 relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6"
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

              <div className="sm:flex sm:items-start relative z-50">
                <div className="w-full">
                  <div className="text-center mb-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Add Products
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Add one or more products to your store
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {products.map((product, productIndex) => (
                      <div
                        key={productIndex}
                        className="border border-gray-200 rounded-lg p-6"
                        data-product-index={productIndex}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-gray-900">
                            Product {productIndex + 1}
                          </h4>
                          {products.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeProduct(productIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Basic Information */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Product Name *
                              </label>
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) =>
                                  updateProduct(
                                    productIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Description *
                              </label>
                              <textarea
                                value={product.description}
                                onChange={(e) =>
                                  updateProduct(
                                    productIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Category
                              </label>
                              <select
                                value={product.category}
                                onChange={(e) =>
                                  updateProduct(
                                    productIndex,
                                    "category",
                                    e.target.value
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="Clothing">Clothing</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Footwear">Footwear</option>
                                <option value="Electronics">Electronics</option>
                              </select>
                            </div>
                          </div>

                          {/* Pricing and Inventory */}
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Original Price (₦) *
                              </label>
                              <input
                                type="number"
                                value={product.originalPrice}
                                onChange={(e) =>
                                  updateProduct(
                                    productIndex,
                                    "originalPrice",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                min="0"
                                step="0.01"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Discount Percentage (%)
                              </label>
                              <input
                                type="number"
                                value={product.discountPercentage}
                                onChange={(e) =>
                                  updateProduct(
                                    productIndex,
                                    "discountPercentage",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                                max="100"
                                step="0.01"
                              />
                              {product.discountPercentage > 0 && (
                                <p className="mt-1 text-sm text-green-600">
                                  Sale Price: ₦
                                  {(
                                    product.originalPrice *
                                    (1 - product.discountPercentage / 100)
                                  ).toFixed(2)}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Quantity
                              </label>
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) =>
                                  updateProduct(
                                    productIndex,
                                    "quantity",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Sizes */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Sizes
                          </label>
                          <div className="space-y-2">
                            {product.sizes.map((size, sizeIndex) => (
                              <div
                                key={sizeIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="text"
                                  value={size}
                                  onChange={(e) =>
                                    updateArrayItem(
                                      productIndex,
                                      "sizes",
                                      sizeIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g., S, M, L, XL"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem(
                                      productIndex,
                                      "sizes",
                                      sizeIndex
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                addArrayItem(productIndex, "sizes")
                              }
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Size</span>
                            </button>
                          </div>
                        </div>

                        {/* Colors */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Colors
                          </label>
                          <div className="space-y-2">
                            {product.colors.map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="text"
                                  value={color}
                                  onChange={(e) =>
                                    updateArrayItem(
                                      productIndex,
                                      "colors",
                                      colorIndex,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g., Red, Blue, Black"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem(
                                      productIndex,
                                      "colors",
                                      colorIndex
                                    )
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                addArrayItem(productIndex, "colors")
                              }
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add Color</span>
                            </button>
                          </div>
                        </div>

                        {/* Images */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Images
                          </label>
                          <div
                            {...getRootProps()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                          >
                            <input {...getInputProps()} />
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Drag & drop images here, or click to select
                            </p>
                          </div>

                          {product.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-4">
                              {product.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative">
                                  <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Product ${imageIndex + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeImage(productIndex, imageIndex)
                                    }
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delivery Options */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Options
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Lagos Delivery
                              </h4>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      product.deliveryOptions.lagosPickup
                                    }
                                    onChange={(e) =>
                                      updateDeliveryOption(
                                        productIndex,
                                        "lagosPickup",
                                        e.target.checked
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Pickup</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={product.deliveryOptions.lagosDoor}
                                    onChange={(e) =>
                                      updateDeliveryOption(
                                        productIndex,
                                        "lagosDoor",
                                        e.target.checked
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Door Delivery</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Outside Lagos
                              </h4>
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      product.deliveryOptions.outsidePickup
                                    }
                                    onChange={(e) =>
                                      updateDeliveryOption(
                                        productIndex,
                                        "outsidePickup",
                                        e.target.checked
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Pickup</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      product.deliveryOptions.outsideDoor
                                    }
                                    onChange={(e) =>
                                      updateDeliveryOption(
                                        productIndex,
                                        "outsideDoor",
                                        e.target.checked
                                      )
                                    }
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Door Delivery</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={addProduct}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Another Product</span>
                      </button>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            `Add ${products.length} Product${
                              products.length > 1 ? "s" : ""
                            }`
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
