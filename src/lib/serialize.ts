export function serializeProduct(product: any): any {
  if (!product) return product;
  return {
    ...product,
    price: Number(product.price),
    compare_price: product.compare_price ? Number(product.compare_price) : null,
    cost: product.cost ? Number(product.cost) : null,
  };
}

export function serializeOrder(order: any): any {
  if (!order) return order;
  return {
    ...order,
    total_amount: Number(order.total_amount),
    subtotal: Number(order.subtotal),
    discount_amount: Number(order.discount_amount),
    shipping_cost: Number(order.shipping_cost),
    tax_amount: Number(order.tax_amount),
    items: order.items?.map((item: any) => ({
      ...item,
      price_snapshot: Number(item.price_snapshot),
      total_snapshot: Number(item.total_snapshot),
      tax_snapshot: Number(item.tax_snapshot),
    })),
  };
}

export function serializeCoupon(coupon: any): any {
  if (!coupon) return coupon;
  return {
    ...coupon,
    discount_value: Number(coupon.discount_value),
    min_order_amount: coupon.min_order_amount ? Number(coupon.min_order_amount) : null,
    max_discount: coupon.max_discount ? Number(coupon.max_discount) : null,
  };
}
