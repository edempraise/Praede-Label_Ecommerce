"use client";

import { CheckCircle, CreditCard, MapPin, UploadCloud } from "lucide-react";
import { FC } from "react";

interface Step {
  number: number;
  title: string;
  icon: React.ElementType;
}

interface ProgressStepsProps {
  currentStep: number;
}

const steps: Step[] = [
  { number: 1, title: "Cart Review", icon: CheckCircle },
  { number: 2, title: "Shipping Info", icon: MapPin },
  { number: 3, title: "Payment", icon: CreditCard },
  { number: 4, title: "Receipt Upload", icon: UploadCloud },
];

const ProgressSteps: FC<ProgressStepsProps> = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  Step {step.number}
                </p>
                <p
                  className={`text-xs ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                  <div
                    className={`h-full ${
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;
