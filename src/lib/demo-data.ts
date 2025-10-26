import { supabase } from "./supabase";

export async function loadDemoData() {
  try {
    // 1. Create categories
    const categoriesData = [
      { name: "Shirts", description: "Formal and casual shirts" },
      { name: "Trousers", description: "Formal trousers and pants" },
      { name: "Accessories", description: "Ties, belts, and more" },
    ];

    const { data: categories, error: catError } = await supabase
      .from("categories")
      .upsert(categoriesData, { onConflict: "name" })
      .select();

    if (catError) throw catError;

    // 2. Create a stock location
    const { data: locations, error: locError } = await supabase
      .from("stock_locations")
      .upsert([{ name: "Main Store", description: "Primary retail location" }], {
        onConflict: "name",
      })
      .select();

    if (locError) throw locError;
    const mainLocation = locations?.[0];

    if (!categories || !mainLocation) {
      throw new Error("Failed to create base data");
    }

    // 3. Create sample products
    const productsData = [
      {
        name: "Cotton Formal Shirt - White",
        sku: "CFS-W001",
        category_id: categories.find((c) => c.name === "Shirts")?.id,
        description: "Premium white cotton formal shirt",
        cost_price: 500,
        mrp: 999,
        tax_percent: 5,
        active: true,
        attributes: { size: "M", color: "White" },
      },
      {
        name: "Cotton Formal Shirt - Blue",
        sku: "CFS-B002",
        category_id: categories.find((c) => c.name === "Shirts")?.id,
        description: "Premium blue cotton formal shirt",
        cost_price: 550,
        mrp: 1099,
        tax_percent: 5,
        active: true,
        attributes: { size: "L", color: "Blue" },
      },
      {
        name: "Linen Casual Shirt",
        sku: "LCS-001",
        category_id: categories.find((c) => c.name === "Shirts")?.id,
        description: "Breathable linen casual shirt",
        cost_price: 600,
        mrp: 1199,
        tax_percent: 5,
        active: true,
        attributes: { size: "M", color: "Beige" },
      },
      {
        name: "Formal Trouser - Black",
        sku: "FT-B001",
        category_id: categories.find((c) => c.name === "Trousers")?.id,
        description: "Classic black formal trousers",
        cost_price: 700,
        mrp: 1499,
        tax_percent: 5,
        active: true,
        attributes: { size: "32", color: "Black" },
      },
      {
        name: "Formal Trouser - Grey",
        sku: "FT-G002",
        category_id: categories.find((c) => c.name === "Trousers")?.id,
        description: "Classic grey formal trousers",
        cost_price: 700,
        mrp: 1499,
        tax_percent: 5,
        active: true,
        attributes: { size: "34", color: "Grey" },
      },
      {
        name: "Chinos - Khaki",
        sku: "CH-K001",
        category_id: categories.find((c) => c.name === "Trousers")?.id,
        description: "Comfortable khaki chinos",
        cost_price: 650,
        mrp: 1299,
        tax_percent: 5,
        active: true,
        attributes: { size: "32", color: "Khaki" },
      },
      {
        name: "Silk Tie - Navy",
        sku: "ST-N001",
        category_id: categories.find((c) => c.name === "Accessories")?.id,
        description: "Premium silk navy tie",
        cost_price: 200,
        mrp: 499,
        tax_percent: 5,
        active: true,
        attributes: { color: "Navy" },
      },
      {
        name: "Leather Belt - Brown",
        sku: "LB-B001",
        category_id: categories.find((c) => c.name === "Accessories")?.id,
        description: "Genuine leather brown belt",
        cost_price: 300,
        mrp: 699,
        tax_percent: 5,
        active: true,
        attributes: { size: "34", color: "Brown" },
      },
      {
        name: "Leather Belt - Black",
        sku: "LB-BL001",
        category_id: categories.find((c) => c.name === "Accessories")?.id,
        description: "Genuine leather black belt",
        cost_price: 300,
        mrp: 699,
        tax_percent: 5,
        active: true,
        attributes: { size: "36", color: "Black" },
      },
      {
        name: "Pocket Square Set",
        sku: "PS-001",
        category_id: categories.find((c) => c.name === "Accessories")?.id,
        description: "Set of 3 premium pocket squares",
        cost_price: 250,
        mrp: 599,
        tax_percent: 5,
        active: true,
        attributes: { color: "Mixed" },
      },
    ];

    const { data: products, error: prodError } = await supabase
      .from("products")
      .upsert(productsData, { onConflict: "sku" })
      .select();

    if (prodError) throw prodError;

    // 4. Add initial stock
    if (products && mainLocation) {
      const stockData = products.map((product) => ({
        product_id: product.id,
        location_id: mainLocation.id,
        quantity: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
        reserved: 0,
        last_movement_at: new Date().toISOString(),
      }));

      const { error: stockError } = await supabase
        .from("product_stock")
        .upsert(stockData, { onConflict: "product_id,location_id" });

      if (stockError) throw stockError;
    }

    return {
      success: true,
      message: `Created ${categories.length} categories, ${products?.length || 0} products, and initial stock`,
    };
  } catch (error) {
    console.error("Demo data error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to load demo data",
    };
  }
}
