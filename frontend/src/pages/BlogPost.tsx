import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlogPostBySlug, getRelatedPosts, BlogPost as BlogPostType, categoryLabels } from '../services/blogApi';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getBlogPostBySlug(slug!);
      setPost(response.data);

      // Fetch related posts
      const relatedResponse = await getRelatedPosts(slug!, 3);
      setRelatedPosts(relatedResponse.data);
    } catch (error: any) {
      console.error('Error fetching post:', error);
      toast.error('Artículo no encontrado');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  // Article Schema for SEO
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featuredImage || "https://ingenieria-software-2025.vercel.app/logo192.png",
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      ...(post.author.avatar && { "image": post.author.avatar })
    },
    "publisher": {
      "@type": "Organization",
      "name": "TalentTrace",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ingenieria-software-2025.vercel.app/logo192.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ingenieria-software-2025.vercel.app/blog/${post.slug}`
    },
    "articleSection": categoryLabels[post.category] || post.category,
    "keywords": post.tags.join(', ')
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://ingenieria-software-2025.vercel.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://ingenieria-software-2025.vercel.app/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://ingenieria-software-2025.vercel.app/blog/${post.slug}`
      }
    ]
  };

  // Combined schema
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema]
  };

  // ALWAYS use self canonical - ignore any DB value to prevent Bing confusion
  const selfCanonical = `https://ingenieria-software-2025.vercel.app/blog/${post.slug}`;

  return (
    <>
      <SEO
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        keywords={post.metaKeywords?.join(', ') || post.tags.join(', ')}
        canonicalUrl={selfCanonical}
        ogImage={post.featuredImage}
        ogType="article"
        articlePublishedTime={post.publishedAt || post.createdAt}
        articleModifiedTime={post.updatedAt}
        articleAuthor={post.author.name}
        articleSection={categoryLabels[post.category]}
        articleTags={post.tags}
        schemaData={combinedSchema}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-indigo-600">Inicio</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-indigo-600">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>
          </div>
        </div>

        {/* Article Header */}
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Category & Date */}
            <div className="flex items-center gap-4 mb-6">
              <Link
                to={`/blog?category=${post.category}`}
                className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition"
              >
                {categoryLabels[post.category] || post.category}
              </Link>
              <time className="text-sm text-gray-500">
                {formatDate(post.publishedAt || post.createdAt)}
              </time>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">{post.viewCount} vistas</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 pb-8 border-b mb-8">
              {post.author.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <p className="text-sm text-gray-500">Autor</p>
              </div>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto rounded-lg shadow-lg mb-12"
              />
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }}
            />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="border-t pt-8 mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Etiquetas:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="border-t border-b py-8 mb-12">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Compartir:</h3>
              <div className="flex gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <span>Twitter</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  <span>Facebook</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Artículos relacionados</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map(related => (
                    <Link
                      key={related._id}
                      to={`/blog/${related.slug}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      {related.featuredImage && (
                        <img
                          src={related.featuredImage}
                          alt={related.title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <span className="text-xs font-medium text-indigo-600">
                          {categoryLabels[related.category]}
                        </span>
                        <h3 className="font-semibold text-gray-900 mt-2 mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{related.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Back to Blog */}
            <div className="mt-12 text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                ← Volver al Blog
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPost;
