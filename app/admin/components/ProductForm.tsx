'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Plus, Minus, Upload, Trash2 } from 'lucide-react';
import { Product, Category } from '@/types';
import { supabase } from '@/lib/supabase';
import { Combobox } from '@/components/ui/combobox';

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  quantity: number;
  size: string[];
  color: string[];
  images: (File | string)[];
  delivery_options: string[];
}

interface ProductFormProps {
  product: ProductFormData;
  onChange?: (data: ProductFormData) => void;
  onRemove: () => void;
  isSaving: boolean;
  onSubmit?: (data: ProductFormData) => void;
}

const ProductForm = ({
  product,
  onChange,
  onRemove,
  isSaving,
  onSubmit,
}: ProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>(product);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleAddNewCategory = async (categoryName: string) => {
    if (categoryName.trim() === '') return;
    const { data, error } = await supabase
      .from('categories')
      .insert({ name: categoryName })
      .select()
      .single();
    if (error) {
      console.error('Error adding category:', error);
    } else {
      setCategories([...categories, data]);
      setFormData((prev) => ({ ...prev, category: data.name }));
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...acceptedFiles],
      }));
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const newDeliveryOptions = prev.delivery_options.includes(option)
        ? prev.delivery_options.filter((o) => o !== option)
        : [...prev.delivery_options, option];
      return { ...prev, delivery_options: newDeliveryOptions };
    });
  };

  const addArrayItem = (field: 'size' | 'color') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const updateArrayItem = (field: 'size' | 'color', itemIndex: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, j) => (j === itemIndex ? value : item)),
    }));
  };

  const removeArrayItem = (field: 'size' | 'color', itemIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, j) => j !== itemIndex),
    }));
  };

  const removeImage = (imageIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, j) => j !== imageIndex),
    }));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 text-red-600 hover:text-red-800"
      >
        <Trash2 className="w-5 h-5" />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <Combobox
              options={categories.map(cat => ({ value: cat.name.toLowerCase(), label: cat.name }))}
              value={formData.category}
              onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              onCreate={handleAddNewCategory}
              placeholder="Select or create a category..."
              emptyMessage="No category found."
              className="mt-1"
            />
          </div>
        </div>

        {/* Pricing and Inventory */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (₦) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Original Price (₦)</label>
            <input
              type="number"
              name="original_price"
              value={formData.original_price}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Sizes</label>
        <div className="space-y-2">
          {formData.size.map((size, sizeIndex) => (
            <div key={sizeIndex} className="flex items-center space-x-2">
              <input
                type="text"
                value={size}
                onChange={(e) => updateArrayItem('size', sizeIndex, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., S, M, L, XL"
              />
              <button type="button" onClick={() => removeArrayItem('size', sizeIndex)} className="text-red-600 hover:text-red-800">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('size')} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
            <Plus className="w-4 h-4" />
            <span>Add Size</span>
          </button>
        </div>
      </div>

      {/* Colors */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Colors</label>
        <div className="space-y-2">
          {formData.color.map((color, colorIndex) => (
            <div key={colorIndex} className="flex items-center space-x-2">
              <input
                type="text"
                value={color}
                onChange={(e) => updateArrayItem('color', colorIndex, e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Red, Blue, Black"
              />
              <button type="button" onClick={() => removeArrayItem('color', colorIndex)} className="text-red-600 hover:text-red-800">
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('color')} className="flex items-center space-x-1 text-blue-600 hover:text-blue-800">
            <Plus className="w-4 h-4" />
            <span>Add Color</span>
          </button>
        </div>
      </div>

      {/* Images */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
        <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors">
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Drag & drop images here, or click to select</p>
        </div>
        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {formData.images.map((image, imageIndex) => (
              <div key={imageIndex} className="relative">
                <img
                  src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                  alt={`Product ${imageIndex + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button type="button" onClick={() => removeImage(imageIndex)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Options */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Options</label>
        <div className="grid grid-cols-2 gap-4">
          {[
            'Lagos Pickup',
            'Lagos Door Delivery',
            'Outside Lagos Pickup',
            'Outside Lagos Door Delivery',
          ].map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.delivery_options.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="mr-2"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {onSubmit && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => onSubmit(formData)}
            disabled={isSaving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Product"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
