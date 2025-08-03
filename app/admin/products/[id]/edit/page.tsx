'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, Review } from '@/types';
import { getProductById, updateProduct, deleteProduct, getReviewsByProductId, getCategories } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Edit, Star } from 'lucide-react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductEditPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Partial<Product> | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [fetchedProduct, fetchedCategories] = await Promise.all([
                    getProductById(id as string),
                    getCategories()
                ]);

                if (!fetchedProduct) {
                    setError('Product not found.');
                } else {
                    setProduct(fetchedProduct);
                    const fetchedReviews = await getReviewsByProductId(id as string);
                    setReviews(fetchedReviews);
                }
                setCategories(fetchedCategories);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to fetch product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductAndReviews();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let processedValue: any = value;
        if (type === 'number') {
            processedValue = value ? parseFloat(value) : 0;
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

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;

    const renderEditableField = (field: keyof Product, label: string, type: 'text' | 'textarea' | 'number' | 'checkbox' = 'text') => {
        if (editingField === field) {
            return (
                <div>
                    <label htmlFor={field} className="block text-sm font-medium text-gray-700">{label}</label>
                    {type === 'textarea' ? (
                        <textarea name={field} id={field} value={product[field] as string || ''} onChange={handleInputChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                    ) : (
                        <input type={type} name={field} id={field} value={product[field] as any || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    )}
                    <button onClick={() => setEditingField(null)} className="text-sm text-blue-600 mt-1">Done</button>
                </div>
            );
        }
        return (
            <div className="flex justify-between items-center">
                <div>
                    <span className="font-bold">{label}: </span>
                    <span>{Array.isArray(product[field]) ? (product[field] as string[]).join(', ') : product[field]?.toString()}</span>
                </div>
                <button onClick={() => setEditingField(field)} className="text-blue-600"><Edit className="w-4 h-4" /></button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/products" className="flex items-center text-blue-600 hover:underline mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Products
                </Link>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Carousel className="w-full max-w-xs">
                            <CarouselContent>
                                {product.images?.map((image, index) => (
                                    <CarouselItem key={index}>
                                        <div className="p-1">
                                            <div className="relative aspect-square rounded-lg overflow-hidden">
                                                <Image
                                                    src={image || '/placeholder-product.jpg'}
                                                    alt={`${product.name} image ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>

                        <div className="space-y-6">
                            {renderEditableField('name', 'Product Name')}
                            <div className="flex items-center">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 ml-2">({averageRating.toFixed(1)} stars) - {reviews.length} reviews</span>
                            </div>
                            {renderEditableField('description', 'Description', 'textarea')}
                            {renderEditableField('price', 'Price', 'number')}
                            {renderEditableField('original_price', 'Original Price', 'number')}
                            {renderEditableField('quantity', 'Quantity', 'number')}
                            {renderEditableField('discount', 'Discount', 'number')}
                            {renderEditableField('delivery_options', 'Delivery Options (comma-separated)')}
                            {editingField === 'category' ? (
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                    <select name="category" id="category" value={product.category || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                        {categories.map(category => (
                                            <option key={category.id} value={category.name}>{category.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={() => setEditingField(null)} className="text-sm text-blue-600 mt-1">Done</button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-bold">Category: </span>
                                        <span>{product.category}</span>
                                    </div>
                                    <button onClick={() => setEditingField('category')} className="text-blue-600"><Edit className="w-4 h-4" /></button>
                                </div>
                            )}
                            {renderEditableField('size', 'Sizes (comma-separated)')}
                            {renderEditableField('color', 'Colors (comma-separated)')}
                            <div>
                                <label htmlFor="images" className="block text-sm font-medium text-gray-700">Images</label>
                                <input type="file" name="images" id="images" multiple onChange={(e) => {
                                    if (e.target.files) {
                                        const files = Array.from(e.target.files);
                                        // Here you would typically upload the files and get back URLs
                                        // For now, we'll just store the file names
                                        const fileNames = files.map(file => file.name);
                                        setProduct(prev => prev ? { ...prev, images: [...(prev.images || []), ...fileNames] } : null);
                                    }
                                }} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>
                        {reviews.length > 0 ? (
                            <div className="space-y-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b pb-4">
                                        <div className="flex items-center mb-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-600 ml-2">by {review.user.email || "Anonymous"}</span>
                                        </div>
                                        <p className="text-gray-700">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <p className="text-gray-600">No reviews yet.</p>
                            </div>
                        )}
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
