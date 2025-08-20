"use server";

import { supabaseServer } from "@/lib/supabase-server";
import { Category } from "@/types";

export const getCategories = async (): Promise<Category[]> => {
  const { data: categories, error } = await supabaseServer
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories as Category[];
};
