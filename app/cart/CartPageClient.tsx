"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { useServerTranslation } from "@/hooks/useServerTranslation";
import SafeImage from "@/components/custom/safe-image";
import { formatPrice } from "@/lib/common/cart";
import {
  getProductImageUrl,
  getFirstImageUrl,
} from "@/lib/common/supabase-storage";
import { toast } from "sonner";
import { redirectToCheckout } from "../_actions/checkout";

export default function CartPageClient() {
  const { cart, updateQuantity, removeItem, clear } = useCart();
  const { t, locale, isRTL } = useServerTranslation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);

    try {
      await redirectToCheckout(cart.items);
      // Clear cart after successful redirect
      clear();
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to proceed to checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t("cart.empty.title")}
            </h1>
            <p className="text-gray-600 mb-8">{t("cart.empty.description")}</p>
            <Link href="/products">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                {t("cart.empty.shopNow")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div
            className={`flex items-center gap-2 text-sm text-gray-600 mb-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Link href="/" className="hover:text-gray-900">
              {t("header.nav.home")}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{t("cart.title")}</span>
          </div>
          <div
            className={`flex items-center justify-between ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <h1 className="text-3xl font-bold text-gray-900">
              {t("cart.title")}
            </h1>
            <Badge variant="secondary" className="text-sm">
              {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const primaryImage = item.product.primary_image
                ? getProductImageUrl(item.product.primary_image)
                : getFirstImageUrl(item.product.images);

              const productName =
                locale === "ar"
                  ? item.product.name_ar || item.product.name_en
                  : item.product.name_en;

              const productPrice = item.product.price || 0;
              const itemTotal = productPrice * item.quantity;

              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div
                      className={`flex gap-4 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0">
                        <SafeImage
                          src={primaryImage || "/placeholder.svg"}
                          alt={productName || "Product"}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-lg"
                          fallbackType="product"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={`flex justify-between items-start mb-2 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="text-lg font-semibold text-gray-900 hover:text-purple-600 line-clamp-2"
                            >
                              {productName}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(
                                productPrice,
                                item.product.currency,
                                locale
                              )}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Quantity Controls */}
                        <div
                          className={`flex items-center justify-between ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatPrice(
                              itemTotal,
                              item.product.currency,
                              locale
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {t("cart.summary.title")}
                </h2>

                <div className="space-y-3 mb-6">
                  <div
                    className={`flex justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-gray-600">
                      {t("cart.summary.subtotal")}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(
                        cart.total,
                        cart.items[0]?.product.currency,
                        locale
                      )}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-gray-600">
                      {t("cart.summary.shipping")}
                    </span>
                    <span className="font-semibold text-green-600">
                      {t("cart.summary.free")}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-gray-600">
                      {t("cart.summary.tax")}
                    </span>
                    <span className="font-semibold">
                      {formatPrice(
                        cart.total * 0.05,
                        cart.items[0]?.product.currency,
                        locale
                      )}
                    </span>
                  </div>
                  <div
                    className={`flex justify-between text-lg font-bold border-t pt-3 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <span>{t("cart.summary.total")}</span>
                    <span>
                      {formatPrice(
                        cart.total * 1.05,
                        cart.items[0]?.product.currency,
                        locale
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-purple-600 hover:bg-purple-700 mb-4"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <span>{t("cart.checkout")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={clear}
                >
                  {t("cart.clear")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
