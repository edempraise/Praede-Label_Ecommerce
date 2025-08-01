"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import {
  createOrder,
  updateOrderStatus,
  uploadPaymentReceipt,
  supabase,
} from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { saveShippingInfo, getShippingInfo } from "@/lib/supabase";
import ProgressSteps from "./components/ProgressSteps";
import CartReviewStep from "./components/CartReviewStep";
import ShippingInfoStep from "./components/ShippingInfoStep";
import PaymentStep from "./components/PaymentStep";

const CheckoutPage = () => {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const userCart = user ? cart[user.id] || [] : [];
  const [paymentMethod, setPaymentMethod] = useState<
    "paystack" | "bank_transfer" | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [orderData, setOrderData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    city: "",
    state: "",
  });
  const [saveInfo, setSaveInfo] = useState(false);
  const [mounted, setMounted] = useState(false);

  const paystackPublicKey = "pk_test_e16157c8199026191661fd46cc917905bb63c367";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setDbUser(data);
        }
      }
    };
    fetchUser();
  }, [user]);

  useEffect(() => {
    if (mounted && user) {
      if (userCart.length === 0) {
        router.push("/cart");
      }
      // Fetch shipping info
      getShippingInfo(user.id).then((info) => {
        if (info) {
          setOrderData({
            customer_name: info.customer_name || "",
            customer_email: user.email || "",
            customer_phone: info.customer_phone || "",
            shipping_address: info.shipping_address || "",
            city: info.city || "",
            state: info.state || "",
          });
        } else {
          setOrderData((prev) => ({ ...prev, customer_email: user.email || "" }));
        }
      });
    }
  }, [user, userCart, router, mounted]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNextStep = async () => {
    if (currentStep === 2 && saveInfo && user) {
      try {
        await saveShippingInfo(user.id, {
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          city: orderData.city,
          state: orderData.state,
        });
        toast({
          title: "Shipping Info Saved",
          description: "Your shipping information has been saved for future orders.",
        });
      } catch (error) {
        console.error("Error saving shipping info:", error);
        toast({
          title: "Error",
          description: "Could not save shipping information.",
          variant: "destructive",
        });
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePaystackSuccess = async (reference: any) => {
    try {
      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      const orderPayload = {
        ...orderData,
        items: userCart,
        total_amount: getCartTotal(user.id),
        status: "paid",
        payment_receipt: reference.reference,
      };

      const order = await createOrder(orderPayload);
      clearCart(user.id);
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      });
      router.push("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  const handlePaystackClose = () => {
    console.log("Paystack payment closed");
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      const orderPayload = {
        ...orderData,
        items: userCart,
        total_amount: getCartTotal(user.id),
        status: "pending",
      };

      const order = await createOrder(orderPayload);

      const receiptUrl = await uploadPaymentReceipt(file, order.id);

      await updateOrderStatus(order.id, "payment_review");

      clearCart(user.id);
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      });
      router.push("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBankTransferContinue = async () => {
    try {
      if (!user) throw new Error("User not authenticated");

      const orderPayload = {
        ...orderData,
        customer_id: user.id, // ✅ Required for RLS check
        items: userCart,
        total_amount: getCartTotal(user.id),
        status: "pending" as const,
      };

      const order = await createOrder(orderPayload);
      clearCart(user.id);
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
      });
      router.push("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressSteps currentStep={currentStep} />

        <div className="bg-white rounded-lg shadow-md p-6">
          {currentStep === 1 && (
            <CartReviewStep
              userCart={userCart}
              getCartTotal={getCartTotal}
              handleNextStep={handleNextStep}
              user={user}
            />
          )}

          {currentStep === 2 && (
            <ShippingInfoStep
              orderData={orderData}
              handleInputChange={handleInputChange}
              saveInfo={saveInfo}
              setSaveInfo={setSaveInfo}
              handlePrevStep={handlePrevStep}
              handleNextStep={handleNextStep}
            />
          )}

          {currentStep === 3 && (
            <PaymentStep
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              handlePrevStep={handlePrevStep}
              user={user}
              getCartTotal={getCartTotal}
              orderData={orderData}
              paystackPublicKey={paystackPublicKey}
              handlePaystackSuccess={handlePaystackSuccess}
              handlePaystackClose={handlePaystackClose}
              handleFileUpload={handleFileUpload}
              isUploading={isUploading}
              handleBankTransferContinue={handleBankTransferContinue}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
