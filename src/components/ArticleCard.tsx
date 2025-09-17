import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { Database } from '../lib/supabase'

type Article = Database['public']['Tables']['articles']['Row']

interface ArticleCardProps {
  article: Article
  showStatus?: boolean
}

export function ArticleCard({ article, showStatus = false }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {article.featured_image_url && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(article.created_at), 'MMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(article.content.split(' ').length / 200)} min read</span>
            </div>
          </div>
          
          {showStatus && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              article.status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {article.status}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-indigo-600 transition-colors">
          <Link to={`/article/${article.id}`}>
            {article.title}
          </Link>
        </h2>

        <p className="text-gray-600 line-clamp-3 mb-4">
          {article.excerpt}
        </p>

        <Link
          to={`/article/${article.id}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
        >
          Read more →
        </Link>
      </div>
    </article>
  )
}