'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { Product } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductDisplayProps {
  product: Product;
  averageRating?: number;
  reviewsCount?: number;
  selectedColor: string;
  onColorChange: (color: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  children?: React.ReactNode;
}

const ProductDisplay = ({
  product,
  averageRating = 0,
  reviewsCount = 0,
  selectedColor,
  onColorChange,
  selectedSize,
  onSizeChange,
  children
}: ProductDisplayProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Product Images */}
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {product.images.map((image, index) => (
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

      {/* Product Details */}
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
        {reviewsCount > 0 && (
          <div className="flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">({averageRating.toFixed(1)} stars) - {reviewsCount} reviews</span>
          </div>
        )}
        <p className="text-gray-700">{product.description}</p>

        {/* Category */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Category</h3>
          <p className="text-gray-600">{product.category}</p>
        </div>

        {/* Quantity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Quantity in Stock</h3>
          <p className="text-gray-600">{product.quantity}</p>
        </div>

        {/* Delivery Options */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Options</h3>
          <div className="flex flex-wrap gap-2">
            {product.delivery_options?.map((option) => (
              <span key={option} className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">{option}</span>
            ))}
          </div>
        </div>

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
            {product.color?.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
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
            {product.size?.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`px-4 py-2 rounded-lg border ${
                  selectedSize === size ? 'border-blue-600 ring-2 ring-blue-500' : 'border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {children}
      </div>
    </div>
  );
};

export default ProductDisplay;
