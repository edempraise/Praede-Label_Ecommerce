'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { getProductById, updateProduct, deleteProduct } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const ProductEditPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Partial<Product> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const fetchedProduct = await getProductById(id as string);
                if (!fetchedProduct) {
                    setError('Product not found.');
                } else {
                    setProduct(fetchedProduct);
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to fetch product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;
        if (type === 'number') {
            processedValue = value ? parseFloat(value) : 0;
        }
        if (name === 'size' || name === 'color' || name === 'images') {
            processedValue = value.split(',').map(s => s.trim()).filter(Boolean);
        }

        setProduct(prev => prev ? { ...prev, [name]: processedValue } : null);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setProduct(prev => prev ? { ...prev, [name]: checked } : null);
    };

    const handleSave = async () => {
        if (!product || !id) return;
        setIsSaving(true);
        try {
            const { id: productId, created_at, updated_at, ...updateData } = product;
            await updateProduct(id as string, updateData);
            alert('Product updated successfully!');
            router.push('/admin/products');
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Failed to save product.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (window.confirm('Are you sure you want to permanently delete this product?')) {
            try {
                await deleteProduct(id as string);
                alert('Product deleted successfully.');
                router.push('/admin/products');
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product.');
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading product...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    if (!product) return <div className="flex justify-center items-center h-screen">Product not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/products" className="flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Products
                </Link>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit {product.name}</h1>

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" name="name" id="name" value={product.name || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea name="description" id="description" value={product.description || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (in Kobo/Cents)</label>
                                <input type="number" name="price" id="price" value={product.price || 0} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                             <div>
                                <label htmlFor="original_price" className="block text-sm font-medium text-gray-700">Original Price (Optional)</label>
                                <input type="number" name="original_price" id="original_price" value={product.original_price || 0} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <input type="text" name="category" id="category" value={product.category || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images (comma-separated URLs)</label>
                            <textarea name="images" id="images" value={product.images?.join(', ') || ''} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="size" className="block text-sm font-medium text-gray-700">Sizes (comma-separated)</label>
                            <input type="text" name="size" id="size" value={product.size?.join(', ') || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="color" className="block text-sm font-medium text-gray-700">Colors (comma-separated)</label>
                            <input type="text" name="color" id="color" value={product.color?.join(', ') || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        </div>

                        <div className="flex items-start space-x-8 pt-4">
                            <div className="flex items-center">
                                <input id="in_stock" name="in_stock" type="checkbox" checked={product.in_stock || false} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="in_stock" className="ml-2 block text-sm text-gray-900">In Stock</label>
                            </div>
                            <div className="flex items-center">
                                <input id="featured" name="featured" type="checkbox" checked={product.featured || false} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">Featured Product</label>
                            </div>
                            <div className="flex items-center">
                                <input id="is_visible" name="is_visible" type="checkbox" checked={product.is_visible ?? true} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <label htmlFor="is_visible" className="ml-2 block text-sm text-gray-900">Visible to Customers</label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
                        <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={handleDelete} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
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
