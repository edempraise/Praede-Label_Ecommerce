"use server";

import { supabaseServer } from "@/lib/supabase-server";

export const getCategories = async () => {
  const { data: categories, error } = await supabaseServer
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return categories;
};
