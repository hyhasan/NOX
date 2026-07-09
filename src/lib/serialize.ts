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
    items: order.items?.map((item: any) => ({
      ...item,
      price_snapshot: Number(item.price_snapshot),
    })),
  };
}
