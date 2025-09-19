import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Clock, Download, ArrowLeft } from 'lucide-react'
import { Layout } from '../components/Layout'
import { supabase, Database } from '../lib/supabase'
import toast from 'react-hot-toast'

type Article = Database['public']['Tables']['articles']['Row']

export function ArticleView() {
  const { id } = useParams<{ id: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchArticle(id)
    }
  }, [id])

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('status', 'published')
        .single()

      if (error) throw error
      setArticle(data)
    } catch (error) {
      console.error('Error fetching article:', error)
      toast.error('Article not found')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6 w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded mb-4 w-1/4"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!article) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or is not published yet.</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Home
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
  <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-2xl shadow-md mt-10 mb-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to articles
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            {article.title}
          </h1>
          <div className="flex items-center text-base text-gray-500 space-x-6 mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.created_at), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(article.content.split(' ').length / 200)} min read</span>
            </div>
          </div>
          {article.featured_image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-10 text-gray-800 leading-relaxed prose-img:rounded-xl prose-img:mx-auto prose-img:w-full prose-img:h-auto"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Attachments */}
        {article.attachments && article.attachments.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Downloads</h3>
            <div className="space-y-3">
              {article.attachments.map((attachment: any, index: number) => (
                <a
                  key={index}
                  href={attachment.url}
                  download={attachment.filename}
                  className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">{attachment.filename}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>
    </Layout>
  )
}