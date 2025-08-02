'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProductById, getReviewsByProductId, createReview, hasUserPurchasedProduct } from '@/lib/supabase';
import { Product, Review } from '@/types';
import { useStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ProductDetailPage = () => {
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [canReview, setCanReview] = useState(false);
  const { addToCart, currentUserId } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadProductAndReviews = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const productData = await getProductById(id as string);
        setProduct(productData);

        if (productData) {
          setSelectedColor(productData.color[0] || '');
          setSelectedSize(productData.size[0] || '');
          const reviewData = await getReviewsByProductId(id as string);
          setReviews(reviewData);

          if (user) {
            const purchased = await hasUserPurchasedProduct(user.id, id as string);
            setCanReview(purchased);
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProductAndReviews();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!currentUserId) {
      toast({
        title: 'Login Required',
        description: 'Please login to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    if (product) {
      addToCart(product, quantity, selectedSize, selectedColor, currentUserId);
      toast({
        title: 'Added to Cart',
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;

    if (newRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newReview = await createReview({
        product_id: product.id,
        user_id: user.id,
        rating: newRating,
        comment: newComment,
      });
      setReviews([newReview, ...reviews]);
      setNewRating(0);
      setNewComment('');
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Error Loading Product' : 'Product Not Found'}
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Thumbnails can be added here */}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
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
            <p className="text-gray-700">{product.description}</p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">
                ₦{product.price.toLocaleString()}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  ₦{product.original_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Color Selector */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Color</h3>
              <div className="flex space-x-2">
                {product.color.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedColor === color ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Size</h3>
              <div className="flex space-x-2">
                {product.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedSize === size ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border rounded-full hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border rounded-full hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
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
                    <span className="text-sm text-gray-600 ml-2">by {review.user.email}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            </div>
          )}

          {/* Review Submission Form */}
          {canReview && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="flex items-center mb-4">
                  <span className="mr-2">Your Rating:</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 cursor-pointer ${i < newRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        onClick={() => setNewRating(i + 1)}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  placeholder="Write your review here..."
                  className="w-full p-3 border rounded-lg"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
