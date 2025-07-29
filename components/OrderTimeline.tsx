'use client';

import { motion } from 'framer-motion';
import { Check, Truck, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

const OrderTimeline = ({ status, createdAt }: OrderTimelineProps) => {
  const [animatedTitle, setAnimatedTitle] = useState('');
  const title = 'Order Timeline';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setAnimatedTitle(title.substring(0, i));
      i++;
      if (i > title.length) {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);
  const steps = [
    {
      id: 'paid',
      title: 'Payment Confirmed',
      description: 'Payment has been verified',
      icon: Check,
      color: 'bg-green-500',
    },
    {
      id: 'shipped',
      title: 'Out for Delivery',
      description: 'Your order is on its way',
      icon: Truck,
      color: 'bg-orange-500',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      description: 'Order has been delivered',
      icon: Star,
      color: 'bg-green-600',
    },
  ];

  const getStepIndex = (status: string) => {
    const index = steps.findIndex(step => step.id === status);
    return index !== -1 ? index : 0;
  };

  const currentStepIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{animatedTitle}</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const IconComponent = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 ${
                isCompleted ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? step.color
                      : 'bg-gray-200'
                  } ${isCurrent ? 'ring-4 ring-blue-200' : ''}`}
                >
                  <IconComponent
                    className={`w-5 h-5 ${
                      isCompleted ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className={`font-medium ${
                  isCompleted ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
              </div>
              
              {isCurrent && (
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Estimated Delivery</h4>
        <p className="text-sm text-gray-600">
          Lagos: 24-48 hours | Outside Lagos: 4-7 business days
        </p>
      </div>
    </div>
  );
};

export default OrderTimeline;