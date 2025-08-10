"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase, uploadReceipt } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { saveShippingInfo, getShippingInfo } from "@/lib/supabase";
import ProgressSteps from "./components/ProgressSteps";
import CartReviewStep from "./components/CartReviewStep";
import ShippingInfoStep from "./components/ShippingInfoStep";
import dynamic from "next/dynamic";
const PaymentStep = dynamic(() => import("./components/PaymentStep"), {
  ssr: false,
});
import ReceiptUploadStep from "./components/ReceiptUploadStep";
import { createOrderServer } from "../actions/create-order";

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
  const [isUploading, setIsUploading] = useState(false);

  const paystackPublicKey = "pk_test_e16157c8199026191661fd46cc917905bb63c367";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const { data } = await supabase
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
          setOrderData((prev) => ({
            ...prev,
            customer_email: user.email || "",
          }));
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
          description:
            "Your shipping information has been saved for future orders.",
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
    if (currentStep < 4) {
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
        customer_id: user.id,
        items: userCart,
        total_amount: getCartTotal(user.id),
        status: "paid" as const,
        payment_reference: reference.reference, // replaced payment_receipt
      };

      await createOrderServer(orderPayload);
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

  const handleBankTransferContinue = () => {
    if (paymentMethod === "bank_transfer") {
      setCurrentStep(4);
    }
  };

  const handleReceiptUploadAndCreateOrder = async (receiptFile: File) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      return;
    }
    setIsUploading(true);
    try {
      const receiptUrl = await uploadReceipt(receiptFile);

      const orderPayload = {
        ...orderData,
        customer_id: user.id,
        items: JSON.parse(JSON.stringify(userCart)),
        total_amount: getCartTotal(user.id),
        status: "payment_review" as const,
        payment_receipt: receiptUrl,
      };

      console.log("Cart before sending:", userCart);
      console.log("Sanitized cart:", JSON.parse(JSON.stringify(userCart)));

      await createOrderServer(orderPayload);
      clearCart(user.id);
      toast({
        title: "Order Placed!",
        description:
          "Your order has been successfully placed and is under review.",
      });
      router.push("/orders");
    } catch (error: any) {
      console.error("Error creating order:", JSON.stringify(error, null, 2));
      if (error?.message) console.error("Message:", error.message);
      if (error?.stack) console.error("Stack:", error.stack);
      if (error?.cause) console.error("Cause:", error.cause);

      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
              handleBankTransferContinue={handleBankTransferContinue}
            />
          )}

          {currentStep === 4 && (
            <ReceiptUploadStep
              handlePrevStep={handlePrevStep}
              handleReceiptUpload={handleReceiptUploadAndCreateOrder}
              isUploading={isUploading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
