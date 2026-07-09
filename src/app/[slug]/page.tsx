import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (["products", "cart", "checkout", "about", "contact", "admin"].includes(slug)) return {};
  try {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) return {};
    return {
      title: page.meta_title || `${page.title} - NOX`,
      description: page.meta_description,
    };
  } catch {
    return {};
  }
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (["products", "cart", "checkout", "about", "contact", "admin"].includes(slug)) notFound();

  let page;
  try {
    page = await prisma.page.findUnique({ where: { slug } });
  } catch {
    notFound();
  }
  if (!page || !page.is_published) notFound();

  return (
    <div className="container-site py-16">
      <h1 className="mb-6 text-4xl font-bold">{page.title}</h1>
      <div className="prose prose-neutral max-w-3xl">
        {page.content_html ? (
          <div dangerouslySetInnerHTML={{ __html: page.content_html }} />
        ) : (
          <p>No content yet.</p>
        )}
      </div>
    </div>
  );
}
