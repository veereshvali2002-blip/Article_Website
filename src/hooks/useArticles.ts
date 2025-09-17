import { useState, useEffect } from 'react'
import { supabase, Database } from '../lib/supabase'
import toast from 'react-hot-toast'

type Article = Database['public']['Tables']['articles']['Row']

export function useArticles(includeUnpublished = false) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [includeUnpublished])

  const fetchArticles = async () => {
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (!includeUnpublished) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const createArticle = async (article: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'excerpt'>) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .insert([article])
        .select()
        .single()

      if (error) throw error

      setArticles(prev => [data, ...prev])
      toast.success('Article created successfully')
      return data
    } catch (error) {
      console.error('Error creating article:', error)
      toast.error('Failed to create article')
      throw error
    }
  }

  const updateArticle = async (id: string, updates: Partial<Article>) => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setArticles(prev => prev.map(article => 
        article.id === id ? data : article
      ))
      toast.success('Article updated successfully')
      return data
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error('Failed to update article')
      throw error
    }
  }

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)

      if (error) throw error

      setArticles(prev => prev.filter(article => article.id !== id))
      toast.success('Article deleted successfully')
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article')
      throw error
    }
  }

  return {
    articles,
    loading,
    createArticle,
    updateArticle,
    deleteArticle,
    refetch: fetchArticles
  }
}