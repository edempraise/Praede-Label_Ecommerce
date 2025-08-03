'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { getProductById, updateProduct, deleteProduct } from '@/lib/supabase';
import { ArrowLeft, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import ProductDisplay from '@/components/ProductDisplay';

const ProductDetailPage = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          setError(null);
          const productData = await getProductById(id as string);
          setProduct(productData);
          if (productData) {
            setSelectedColor(productData.color[0] || '');
            setSelectedSize(productData.size[0] || '');
          }
        } catch (err) {
          console.error('Error loading product:', err);
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleUpdate = async (updates: Partial<Product>) => {
    if (!product) return;
    try {
      const updatedProduct = await updateProduct(product.id, updates);
      setProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(product.id);
        router.push('/admin/products');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/admin/products" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Products
          </Link>
        </div>
        <ProductDisplay
          product={product}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          selectedSize={selectedSize}
          onSizeChange={setSelectedSize}
        >
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleUpdate({ featured: !product.featured })}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Star className="w-5 h-5 mr-2" />
                {product.featured ? 'Un-feature' : 'Make Featured'}
              </button>
              <button
                onClick={() => handleUpdate({ in_stock: !product.in_stock })}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                {product.in_stock ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
                {product.in_stock ? 'Set as Out of Stock' : 'Set as In Stock'}
              </button>
              <Link href={`/admin/products/${id}/edit`} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Edit className="w-5 h-5 mr-2" />
                Edit Properties
              </Link>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete Product
              </button>
            </div>
          </div>
        </ProductDisplay>
      </div>
    </div>
  );
};

export default ProductDetailPage;
