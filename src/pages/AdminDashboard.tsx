import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { ArticleCard } from '../components/ArticleCard'
import { ArticleModal } from '../components/ArticleModal'
import { useArticles } from '../hooks/useArticles'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Database } from '../lib/supabase'

type Article = Database['public']['Tables']['articles']['Row']

export function AdminDashboard() {
  const { user } = useAuth()
  const { articles, loading, createArticle, updateArticle, deleteArticle } = useArticles(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleSaveArticle = async (articleData: any) => {
    if (editingArticle) {
      await updateArticle(editingArticle.id, articleData)
    } else {
      await createArticle(articleData)
    }
    setIsModalOpen(false)
    setEditingArticle(null)
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setIsModalOpen(true)
  }

  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id)
    setDeleteConfirm(null)
  }

  const publishedCount = articles.filter(article => article.status === 'published').length
  const draftCount = articles.filter(article => article.status === 'draft').length

  if (loading) {
    return (
      <Layout showAdminNav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout showAdminNav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Article Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your articles and content</p>
          </div>
          <button
            onClick={() => {
              setEditingArticle(null)
              setIsModalOpen(true)
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Article</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{articles.length}</div>
            <div className="text-gray-600">Total Articles</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">{draftCount}</div>
            <div className="text-gray-600">Drafts</div>
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="relative group">
                <ArticleCard article={article} showStatus />
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditArticle(article)}
                    className="bg-white text-indigo-600 p-2 rounded-full shadow-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(article.id)}
                    className="bg-white text-red-600 p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-sm mx-auto">
              <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first article.</p>
              <button
                onClick={() => {
                  setEditingArticle(null)
                  setIsModalOpen(true)
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create Article
              </button>
            </div>
          </div>
        )}

        {/* Article Modal */}
        <ArticleModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingArticle(null)
          }}
          onSave={handleSaveArticle}
          article={editingArticle}
          authorId={user?.id || ''}
        />

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Article</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this article? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteArticle(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}