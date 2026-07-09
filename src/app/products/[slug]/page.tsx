import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { serializeProduct } from "@/lib/serialize";
import { AddToCartButton } from "./add-to-cart-button";
import { ProductGallery } from "./product-gallery";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) return { title: "Product Not Found" };
    return {
      title: `${product.name} - NOX`,
      description: product.description,
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let product, serialized;
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      include: {
        media: { include: { media: true }, orderBy: { sort_order: "asc" } },
        category: true,
        variants: { where: { is_active: true }, orderBy: { sort_order: "asc" } },
        options: { include: { values: { orderBy: { sort_order: "asc" } } }, orderBy: { sort_order: "asc" } },
        attributes: { orderBy: { sort_order: "asc" } },
      },
    });
    if (!product || product.status !== "active") notFound();
    serialized = serializeProduct(product);
  } catch {
    notFound();
  }

  const mediaList = product!.media || [];
  const primaryMedia = mediaList.find((m) => m.is_primary) || mediaList[0];
  const discount = product!.compare_price && Number(product!.compare_price) > Number(product!.price)
    ? Math.round((1 - Number(product!.price) / Number(product!.compare_price)) * 100) : 0;

  return (
    <div className="container-site py-8 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery media={mediaList} productName={product!.name} />

        <div className="space-y-6">
          <div>
            {product!.category && (
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-accent">
                {product!.category.name}
              </p>
            )}
            <h1 className="font-heading text-3xl font-bold text-primary sm:text-4xl">{product!.name}</h1>
            {product!.sku && <p className="mt-1 text-sm text-secondary/50">SKU: {product!.sku}</p>}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(Number(product!.price))}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-secondary/40 line-through">
                  {formatPrice(Number(product!.compare_price))}
                </span>
                <Badge variant="danger">{discount}% OFF</Badge>
              </>
            )}
          </div>

          <div className="feature-card rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${Number(product!.stock_quantity) > 0 ? "bg-accent" : "bg-destructive"}`} />
              <p className="text-sm">
                {Number(product!.stock_quantity) > 0 ? (
                  <span className="font-medium text-accent">
                    In Stock
                    {Number(product!.stock_quantity) <= 10 ? (
                      <span className="ml-1 text-destructive"> (Only {product!.stock_quantity} left)</span>
                    ) : (
                      <span className="ml-1 text-secondary/50"> ({product!.stock_quantity} available)</span>
                    )}
                  </span>
                ) : (
                  <span className="font-medium text-destructive">Out of Stock</span>
                )}
              </p>
            </div>
          </div>

          {product!.description && (
            <div className="prose prose-sm max-w-none text-neutral-600 leading-relaxed">
              <p>{product!.description}</p>
            </div>
          )}

          {product!.attributes && product!.attributes.length > 0 && (
            <div className="space-y-2 rounded-xl border border-border/50 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-secondary/50">Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product!.attributes.map((attr) => (
                  <div key={attr.id} className="flex gap-2">
                    <span className="text-secondary/50">{attr.name}:</span>
                    <span className="font-medium text-primary">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AddToCartButton
            product={serialized}
            imageUrl={primaryMedia?.media.url || ""}
            stockQuantity={Number(product!.stock_quantity)}
          />

          <div className="grid grid-cols-3 gap-3 text-center text-xs text-secondary/50">
            <div className="rounded-xl border border-border/30 bg-muted/30 p-3">
              <p className="font-medium text-primary">Free Shipping</p>
              <p>On orders over $50</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-muted/30 p-3">
              <p className="font-medium text-primary">Easy Returns</p>
              <p>30-day return policy</p>
            </div>
            <div className="rounded-xl border border-border/30 bg-muted/30 p-3">
              <p className="font-medium text-primary">Secure Checkout</p>
              <p>SSL encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
