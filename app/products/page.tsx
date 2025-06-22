import type { Metadata } from "next";
import { Suspense } from "react";

import ProductsPageClient from "./ProductsPageClient";
import { searchProducts, getCategories } from "@/lib/common/supabase-queries";
import {
  getLocaleFromSearchParams,
  getLocaleFromRequest,
  isRTLLocale,
  getTranslations,
} from "@/lib/common/translations";
import { createSsrClient } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const searchParamsObj = new URLSearchParams(params as Record<string, string>);
  const localeFromParams = getLocaleFromSearchParams(searchParamsObj);
  const locale =
    localeFromParams !== "en" ? localeFromParams : getLocaleFromRequest();

  const title = locale === "ar" ? "المنتجات - إليفا" : "Products - Eleva";
  const description =
    locale === "ar"
      ? "تصفح مجموعتنا الكاملة من العطور الفاخرة. اعثر على عطرك المثالي من أفضل العلامات التجارية العالمية."
      : "Browse our complete collection of premium fragrances. Find your perfect scent from the world's finest brands.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `/products?lang=${locale}`,
      languages: {
        en: "/products?lang=en",
        ar: "/products?lang=ar",
      },
    },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchParamsObj = new URLSearchParams(params as Record<string, string>);
  const localeFromParams = getLocaleFromSearchParams(searchParamsObj);

  // Get search parameters
  const query = searchParamsObj.get("q") || "";
  const categoryId = searchParamsObj.get("category")
    ? Number.parseInt(searchParamsObj.get("category")!)
    : undefined;
  const page = Number.parseInt(searchParamsObj.get("page") || "1");
  const limit = 8; // Changed from 20 to 8
  const offset = (page - 1) * limit;

  // Get user for personalized data
  const supabase = await createSsrClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch products and categories
  const [products, categories] = await Promise.all([
    searchProducts(query, categoryId, limit, offset),
    getCategories(),
  ]);

  return (
    <ProductsPageClient
      initialProducts={products}
      categories={categories}
      initialQuery={query}
      initialCategoryId={categoryId}
      currentPage={page}
      hasMore={products.length === limit}
    />
  );
}
