import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.admin.findFirst();
  if (adminExists) {
    console.log("Data already seeded, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 12);

  // ── Admin ──
  await prisma.admin.create({
    data: { username: "admin", password_hash: passwordHash, display_name: "Store Owner", email: "admin@nox.com", role: "super_admin" },
  });

  // ── Site Settings ──
  const settings = [
    { key: "site_name", value: "NOX", group: "general" },
    { key: "site_description", value: "Modern E-Commerce Platform", group: "general" },
    { key: "primary_color", value: "#1C1917", group: "appearance" },
    { key: "secondary_color", value: "#A16207", group: "appearance" },
    { key: "footer_text", value: "© 2026 NOX. All rights reserved.", group: "appearance" },
    { key: "contact_email", value: "hello@nox.com", group: "general" },
    { key: "contact_phone", value: "+1 (555) 000-0000", group: "general" },
    { key: "address", value: "123 Commerce St, New York, NY 10001", group: "general" },
    { key: "currency", value: "USD", group: "checkout" },
    { key: "tax_class", value: "standard", group: "checkout" },
  ];
  for (const s of settings) {
    await prisma.siteSetting.create({ data: { key: s.key, value: s.value, group: s.group } });
  }

  // ── Tax ──
  const taxClass = await prisma.taxClass.create({
    data: { name: "Standard", slug: "standard", description: "Standard VAT/GST", is_default: true },
  });
  await prisma.taxRate.create({
    data: { tax_class_id: taxClass.id, name: "Standard Rate", rate: 20, rate_type: "percentage", is_active: true, country: "US" },
  });

  // ── Customer Group ──
  await prisma.customerGroup.create({ data: { name: "General", slug: "general", description: "Default customer group", is_default: true } });

  // ── Categories ──
  const catClothing = await prisma.category.create({ data: { name: "Clothing", slug: "clothing", description: "Apparel and fashion", sort_order: 1 } });
  const catAccessories = await prisma.category.create({ data: { name: "Accessories", slug: "accessories", description: "Bags, jewelry, and more", sort_order: 2 } });
  const catFeatured = await prisma.category.create({ data: { name: "Featured", slug: "featured", description: "Featured products", sort_order: 0 } });

  // ── Tags ──
  const tagNew = await prisma.tag.create({ data: { name: "New Arrival", slug: "new-arrival" } });
  const tagSale = await prisma.tag.create({ data: { name: "Sale", slug: "sale" } });
  const tagLimited = await prisma.tag.create({ data: { name: "Limited Edition", slug: "limited-edition" } });

  // ── Media entries (sample URLs — replace with real uploads in production) ──
  const mediaTee = await prisma.media.create({
    data: {
      filename: "classic-cotton-tee.jpg", original_name: "classic-cotton-tee.jpg",
      mime_type: "image/jpeg", extension: "jpg", file_size: 50000, file_type: "image",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      thumbnail_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100",
      small_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
      medium_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
      alt_text: "White cotton tee front", caption: "Classic Cotton Tee - Front View",
      storage_provider: "local", status: "ready",
    },
  });
  const mediaTee2 = await prisma.media.create({
    data: {
      filename: "classic-cotton-tee-back.jpg", original_name: "classic-cotton-tee-back.jpg",
      mime_type: "image/jpeg", extension: "jpg", file_size: 45000, file_type: "image",
      url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
      thumbnail_url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=100",
      alt_text: "White cotton tee back", caption: "Classic Cotton Tee - Back View",
      storage_provider: "local", status: "ready",
    },
  });
  const mediaBag = await prisma.media.create({
    data: {
      filename: "leather-bag.jpg", original_name: "leather-bag.jpg",
      mime_type: "image/jpeg", extension: "jpg", file_size: 65000, file_type: "image",
      url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
      thumbnail_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100",
      alt_text: "Leather weekend bag", caption: "Handcrafted Leather Weekend Bag",
      storage_provider: "local", status: "ready",
    },
  });
  const mediaWatch = await prisma.media.create({
    data: {
      filename: "minimalist-watch.jpg", original_name: "minimalist-watch.jpg",
      mime_type: "image/jpeg", extension: "jpg", file_size: 55000, file_type: "image",
      url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
      thumbnail_url: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=100",
      alt_text: "Minimalist watch", caption: "Minimalist Watch - Silver",
      storage_provider: "local", status: "ready",
    },
  });

  // ── Products ──
  const p1 = await prisma.product.create({
    data: {
      name: "Classic Cotton Tee", slug: "classic-cotton-tee",
      description: "Premium comfort meets timeless design. This classic cotton tee is crafted from 100% organic cotton with a relaxed fit perfect for everyday wear.",
      short_description: "Premium organic cotton tee",
      price: 49.99, compare_price: 69.99, cost: 20.00,
      stock_quantity: 150, sku: "TEE-001", track_inventory: true,
      weight: 0.2, category_id: catClothing.id, tax_class_id: taxClass.id,
      status: "active", is_featured: true, is_taxable: true,
      meta_title: "Classic Cotton Tee | NOX", meta_description: "Premium organic cotton classic tee.",
      published_at: new Date(),
      tags: { create: [{ tag_id: tagNew.id }, { tag_id: tagSale.id }] },
      attributes: {
        create: [
          { name: "Material", value: "100% Organic Cotton", sort_order: 0 },
          { name: "Fit", value: "Relaxed", sort_order: 1 },
          { name: "Care", value: "Machine wash cold", sort_order: 2 },
        ],
      },
      options: {
        create: [{
          name: "Size", type: "select", is_required: true, sort_order: 0,
          values: {
            create: [
              { label: "Small", value: "S", sort_order: 0 },
              { label: "Medium", value: "M", sort_order: 1 },
              { label: "Large", value: "L", sort_order: 2 },
            ],
          },
        }],
      },
    },
  });

  // Create product media
  await prisma.productMedia.create({ data: { product_id: p1.id, media_id: mediaTee.id, is_primary: true, sort_order: 0 } });
  await prisma.productMedia.create({ data: { product_id: p1.id, media_id: mediaTee2.id, is_primary: false, sort_order: 1 } });

  // Create variants with option values
  const option = await prisma.productOption.findFirst({ where: { product_id: p1.id } });
  const optValues = await prisma.productOptionValue.findMany({ where: { option_id: option!.id }, orderBy: { sort_order: "asc" } });

  for (const ov of optValues) {
    const variant = await prisma.productVariant.create({
      data: {
        product_id: p1.id, name: `Size ${ov.label}`, sku: `TEE-001-${ov.value}`,
        price: ov.value === "L" ? 54.99 : 49.99, cost: ov.value === "L" ? 22.00 : 20.00,
        stock_quantity: ov.value === "S" ? 50 : ov.value === "M" ? 75 : 25,
        is_active: true, sort_order: ov.sort_order,
      },
    });
    await prisma.variantOptionValue.create({ data: { variant_id: variant.id, option_value_id: ov.id } });
  }

  const p2 = await prisma.product.create({
    data: {
      name: "Leather Weekend Bag", slug: "leather-weekend-bag",
      description: "Handcrafted from full-grain leather, this weekend bag ages beautifully and carries everything you need for a short escape.",
      short_description: "Handcrafted full-grain leather bag",
      price: 299.99, cost: 120.00,
      stock_quantity: 30, sku: "BAG-001", track_inventory: true,
      weight: 1.5, weight_unit: "kg", category_id: catAccessories.id, tax_class_id: taxClass.id,
      status: "active", is_featured: true,
      meta_title: "Leather Weekend Bag | NOX", meta_description: "Handcrafted full-grain leather weekend bag.",
      published_at: new Date(),
      tags: { create: [{ tag_id: tagLimited.id }, { tag_id: tagSale.id }] },
      attributes: {
        create: [
          { name: "Material", value: "Full-Grain Leather", sort_order: 0 },
          { name: "Dimensions", value: "50cm x 30cm x 25cm", sort_order: 1 },
        ],
      },
    },
  });
  await prisma.productMedia.create({ data: { product_id: p2.id, media_id: mediaBag.id, is_primary: true, sort_order: 0 } });

  const p3 = await prisma.product.create({
    data: {
      name: "Minimalist Watch", slug: "minimalist-watch",
      description: "Clean lines and Japanese quartz movement make this watch a daily essential. Sapphire crystal, stainless steel case.",
      short_description: "Japanese quartz, sapphire crystal",
      price: 189.99, compare_price: 249.99, cost: 75.00,
      stock_quantity: 60, sku: "WATCH-001",
      weight: 0.08, weight_unit: "kg", category_id: catAccessories.id, tax_class_id: taxClass.id,
      status: "active", is_featured: true,
      published_at: new Date(),
      tags: { create: [{ tag_id: tagNew.id }] },
      options: {
        create: [{
          name: "Color", type: "select", is_required: true, sort_order: 0,
          values: {
            create: [
              { label: "Silver", value: "Silver", sort_order: 0 },
              { label: "Gold", value: "Gold", sort_order: 1 },
            ],
          },
        }],
      },
    },
  });
  await prisma.productMedia.create({ data: { product_id: p3.id, media_id: mediaWatch.id, is_primary: true, sort_order: 0 } });

  // Create variants for watch
  const watchOption = await prisma.productOption.findFirst({ where: { product_id: p3.id } });
  const watchValues = await prisma.productOptionValue.findMany({ where: { option_id: watchOption!.id } });
  for (const ov of watchValues) {
    const v = await prisma.productVariant.create({
      data: {
        product_id: p3.id, name: ov.label, sku: `WATCH-001-${ov.value === "Silver" ? "S-B" : "G-W"}`,
        price: ov.value === "Gold" ? 209.99 : 189.99, cost: ov.value === "Gold" ? 80.00 : 75.00,
        stock_quantity: ov.value === "Silver" ? 30 : 20,
        is_active: true,
      },
    });
    await prisma.variantOptionValue.create({ data: { variant_id: v.id, option_value_id: ov.id } });
  }

  // ── Customer ──
  const customer = await prisma.customer.create({
    data: { email: "john@example.com", first_name: "John", last_name: "Doe", phone: "+1 (555) 123-4567", is_guest: false, is_verified: true },
  });
  await prisma.address.create({
    data: {
      customer_id: customer.id, label: "Home", first_name: "John", last_name: "Doe",
      phone: "+1 (555) 123-4567", line1: "456 Main Street", line2: "Apt 2B",
      city: "New York", state: "NY", postal_code: "10001", country: "US",
      is_default: true, is_billing: true, is_shipping: true,
    },
  });

  // ── Review ──
  await prisma.review.create({
    data: {
      product_id: p1.id, customer_id: customer.id, title: "Best tee ever!",
      rating: 5, content: "Incredibly soft fabric and perfect fit. Ordering more colors.",
      is_verified_purchase: true, is_approved: true,
    },
  });

  // ── Coupon ──
  await prisma.coupon.create({
    data: {
      code: "WELCOME10", description: "10% off for new customers",
      discount_type: "percentage", discount_value: 10,
      min_order_amount: 50, max_discount: 25, is_active: true,
      usage_limit: 100, usage_limit_per_customer: 1, expires_at: new Date("2027-12-31"),
    },
  });

  // ── Pages ──
  await prisma.page.create({
    data: {
      title: "About Us", slug: "about",
      content_html: "<h1>About NOX</h1><p>NOX is a premium e-commerce destination for discerning customers. Founded in 2024, we curate products that blend timeless design with modern sensibility.</p>",
      meta_title: "About NOX | Premium E-Commerce", meta_description: "Learn about NOX.",
      is_published: true, published_at: new Date(),
    },
  });
  await prisma.page.create({
    data: {
      title: "Shipping & Returns", slug: "shipping-returns",
      content_html: "<h1>Shipping & Returns</h1><h2>Shipping</h2><p>Free shipping on all orders over $100. Standard delivery: 3-5 business days.</p><h2>Returns</h2><p>We accept returns within 30 days. Items must be unused in original packaging.</p>",
      is_published: true, published_at: new Date(),
    },
  });

  // ── Banners ──
  const heroMedia = await prisma.media.create({
    data: {
      filename: "hero-banner.jpg", original_name: "hero-banner.jpg",
      mime_type: "image/jpeg", extension: "jpg", file_size: 120000, file_type: "image",
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
      thumbnail_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300",
      alt_text: "New Collection banner",
      storage_provider: "local", status: "ready",
    },
  });
  const promoMedia = await prisma.media.create({
    data: {
      filename: "promo-banner.jpg", original_name: "promo-banner.jpg",
      mime_type: "image/jpeg", extension: "jpg", file_size: 110000, file_type: "image",
      url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200",
      thumbnail_url: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=300",
      alt_text: "Summer Sale banner",
      storage_provider: "local", status: "ready",
    },
  });

  await prisma.banner.create({
    data: {
      title: "New Collection", subtitle: "Discover timeless pieces crafted for the modern wardrobe",
      image_id: heroMedia.id, link_url: "/products", link_text: "Shop Now",
      position: "hero", is_active: true, sort_order: 0,
    },
  });
  await prisma.banner.create({
    data: {
      title: "Summer Sale", subtitle: "Up to 30% off select styles",
      image_id: promoMedia.id, link_url: "/products?tag=sale", link_text: "Shop Sale",
      position: "promo", is_active: true, sort_order: 1,
    },
  });

  // ── Warehouse ──
  await prisma.warehouse.create({
    data: { name: "Main Warehouse", code: "MAIN", description: "Primary fulfillment center", country: "US", is_active: true, is_primary: true },
  });

  // ── Shipping ──
  const zone = await prisma.shippingZone.create({
    data: { name: "Domestic", slug: "domestic", countries: '["US"]', is_active: true },
  });
  await prisma.shippingMethod.create({
    data: {
      zone_id: zone.id, name: "Standard Shipping", rate_type: "flat", rate_amount: 5.99,
      is_active: true, sort_order: 0, estimated_days_min: 3, estimated_days_max: 5,
    },
  });
  await prisma.shippingMethod.create({
    data: {
      zone_id: zone.id, name: "Free Shipping", rate_type: "free", min_value: 100,
      is_active: true, sort_order: 1, estimated_days_min: 5, estimated_days_max: 7,
    },
  });
  await prisma.shippingMethod.create({
    data: {
      zone_id: zone.id, name: "Express Delivery", rate_type: "flat", rate_amount: 15.99,
      is_active: true, sort_order: 2, estimated_days_min: 1, estimated_days_max: 2,
    },
  });

  // ── Sample Order ──
  await prisma.order.create({
    data: {
      order_number: "NOX-SEED-0001", customer_id: customer.id,
      customer_email: customer.email, customer_name: "John Doe",
      subtotal: 49.99, total_amount: 49.99,
      payment_method: "COD", order_status: "delivered", payment_status: "paid", paid_at: new Date(),
      shipping_address_snapshot: JSON.stringify({ line1: "456 Main Street", city: "New York", state: "NY", postal_code: "10001" }),
      currency: "USD",
      items: {
        create: [{
          product_id: p1.id, product_name_snapshot: "Classic Cotton Tee",
          price_snapshot: 49.99, quantity: 1, total_snapshot: 49.99,
        }],
      },
      status_history: {
        create: [
          { to_status: "pending", changed_by: "system", note: "Order placed" },
          { to_status: "confirmed", changed_by: "system", note: "Payment confirmed" },
          { to_status: "shipped", changed_by: "system", note: "Dispatched via Standard" },
          { to_status: "delivered", changed_by: "system", note: "Delivered successfully" },
        ],
      },
    },
  });

  // ── Notification Template ──
  await prisma.notificationTemplate.create({
    data: {
      code: "order_confirmation", name: "Order Confirmation", type: "email",
      subject: "Order #{{order_number}} Confirmed",
      body_html: "<h1>Thank you {{customer_name}}!</h1><p>Your order #{{order_number}} has been confirmed.</p>",
      body_text: "Thank you {{customer_name}}! Your order #{{order_number}} has been confirmed.",
      variables: '["order_number", "customer_name", "total_amount"]',
      is_active: true,
    },
  });

  // ── Activity Log ──
  await prisma.activityLog.create({
    data: {
      action: "seed", resource_type: "system", resource_name: "Database Seed",
      description: "Initial database seeded with sample data",
      created_at: new Date(),
    },
  });

  console.log("Seed complete: admin, tax, categories, products (with media & variants), customer, review, coupon, pages, banners, shipping, warehouse, sample order, notification template.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
