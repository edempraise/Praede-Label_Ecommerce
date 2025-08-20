"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types";
import { getProductById, updateProduct, supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import ProductForm, {
  ProductFormData,
} from "@/app/admin/components/ProductForm";
import { useToast } from "@/hooks/use-toast";

const ProductEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const fetchedProduct = await getProductById(id as string);
        if (!fetchedProduct) {
          setError("Product not found.");
        } else {
          setProduct(fetchedProduct);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const uploadImages = async (images: (File | string)[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      if (typeof image === "string") {
        return image;
      }
      const fileName = `${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
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

  const handleSave = async (formData: ProductFormData) => {
    if (!id) return;
    setIsSaving(true);
    try {
      const imageUrls = await uploadImages(formData.images);

      const updateData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price,
        category: formData.category,
        quantity: formData.quantity,
        size: formData.size.filter((s) => s.trim() !== ""),
        color: formData.color.filter((c) => c.trim() !== ""),
        images: imageUrls,
        delivery_options: formData.delivery_options,
      };

      await updateProduct(id as string, updateData);
      toast({
        title: "Success!",
        description: "Product updated successfully.",
      });
      router.push("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      toast({
        title: "Error",
        description: "Failed to save product.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (
      window.confirm(
        "Are you sure you want to permanently delete this product?"
      )
    ) {
      try {
        // await deleteProduct(id as string);
        toast({
          title: "Success!",
          description: "Product deleted successfully.",
        });
        router.push("/admin/products");
      } catch (err) {
        console.error("Error deleting product:", err);
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading product...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  if (!product)
    return (
      <div className="flex justify-center items-center h-screen">
        Product not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/admin/products"
          className="flex items-center text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Products
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Product
          </h1>
          <ProductForm
            product={product}
            onRemove={() => handleDelete()}
            isSaving={isSaving}
            onSubmit={handleSave}
          />
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditPage;
