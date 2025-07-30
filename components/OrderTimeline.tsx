'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, FileClock, CheckCircle, Package, PackageCheck, Truck, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Order } from '@/types';

interface OrderTimelineProps {
  status: Order['status'];
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
    { id: 'pending', title: 'Order Placed', description: 'We have received your order.', icon: ShoppingCart, color: 'bg-gray-500' },
    { id: 'payment_review', title: 'Payment in Review', description: 'We are reviewing your payment receipt.', icon: FileClock, color: 'bg-blue-500' },
    { id: 'paid', title: 'Payment Confirmed', description: 'Your payment has been successfully verified.', icon: CheckCircle, color: 'bg-green-500' },
    { id: 'preparing', title: 'Getting Order Ready', description: 'We are preparing your order for shipment.', icon: Package, color: 'bg-purple-500' },
    { id: 'ready_for_delivery', title: 'Ready for Delivery', description: 'Your order is packaged and ready for the courier.', icon: PackageCheck, color: 'bg-indigo-500' },
    { id: 'shipped', title: 'Out for Delivery', description: 'Your order is on its way to you.', icon: Truck, color: 'bg-orange-500' },
    { id: 'delivered', title: 'Delivered', description: 'Your order has been delivered. Enjoy!', icon: Star, color: 'bg-teal-500' },
  ];

  const getStepIndex = (currentStatus: Order['status']) => {
    const index = steps.findIndex(step => step.id === currentStatus);
    return index;
  };

  const currentStepIndex = getStepIndex(status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{animatedTitle}</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex >= index;
          const isCurrent = currentStepIndex === index;
          const IconComponent = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start"
            >
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted ? step.color : 'bg-gray-300'
                  } ${isCurrent ? 'ring-4 ring-blue-300' : ''}`}
                >
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-16 mt-1 ${isCompleted ? step.color : 'bg-gray-300'}`}></div>
                )}
              </div>
              
              <div className="flex-1 pt-1">
                <h4 className={`font-medium ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.description}
                </p>
              </div>
              
              {isCurrent && (
                <div className="flex-shrink-0 pt-1">
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