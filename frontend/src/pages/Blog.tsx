import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllBlogPosts, getBlogCategories, categoryLabels, BlogPost, BlogCategory } from '../services/blogApi';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const Blog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getAllBlogPosts({
          page: currentPage,
          limit: 12,
          category: currentCategory || undefined,
          search: currentSearch || undefined,
          status: 'published'
        });
        setPosts(response.data);
        setPagination(response.pagination);
      } catch (error: any) {
        console.error('Error fetching posts:', error);
        toast.error('Error al cargar los artículos');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getBlogCategories();
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchPosts();
    fetchCategories();
  }, [currentCategory, currentSearch, currentPage]);

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1
    setSearchParams(params);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "TalentTrace Blog",
    "description": "Consejos, insights y tendencias del mercado laboral",
    "url": "https://ingenieria-software-2025.vercel.app/blog",
    "publisher": {
      "@type": "Organization",
      "name": "TalentTrace",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ingenieria-software-2025.vercel.app/logo192.png"
      }
    }
  };

  return (
    <>
      <SEO
        title="Blog - Consejos y Tendencias Laborales"
        description="Descubre consejos de carrera, insights de empresas, tips para entrevistas y tendencias salariales en el mercado laboral."
        keywords="blog laboral, consejos de carrera, entrevistas de trabajo, cultura empresarial, salarios, empleo"
        schemaData={schemaData}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog de TalentTrace</h1>
              <p className="text-xl text-indigo-100">
                Consejos, insights y tendencias del mercado laboral
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Buscar</h3>
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      name="search"
                      placeholder="Buscar artículos..."
                      defaultValue={currentSearch}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="w-full mt-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Buscar
                    </button>
                  </form>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Categorías</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCategoryFilter('')}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        !currentCategory
                          ? 'bg-indigo-100 text-indigo-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      Todas las categorías
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryFilter(cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition flex justify-between items-center ${
                          currentCategory === cat.slug
                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-sm text-gray-500">{cat.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Back to Home */}
                <Link
                  to="/"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  ← Volver al inicio
                </Link>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500 text-lg">No se encontraron artículos</p>
                  {(currentCategory || currentSearch) && (
                    <button
                      onClick={() => setSearchParams({})}
                      className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map(post => (
                      <article key={post._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                          />
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              {categoryLabels[post.category] || post.category}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(post.publishedAt || post.createdAt)}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition">
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          </h2>
                          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {post.author.avatar && (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span className="text-sm text-gray-700">{post.author.name}</span>
                            </div>
                            <Link
                              to={`/blog/${post.slug}`}
                              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                            >
                              Leer más →
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg ${
                            page === currentPage
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
