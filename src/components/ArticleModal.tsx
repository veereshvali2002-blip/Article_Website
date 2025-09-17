import React, { useState, useEffect } from 'react'
import { X, Upload, File, Trash2 } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'
import { FileUpload } from './FileUpload'
import { Database } from '../lib/supabase'

type Article = Database['public']['Tables']['articles']['Row']

interface ArticleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (article: any) => Promise<void>
  article?: Article | null
  authorId: string
}

interface Attachment {
  url: string
  filename: string
  type: string
}

export function ArticleModal({ isOpen, onClose, onSave, article, authorId }: ArticleModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (article) {
      setTitle(article.title)
      setContent(article.content)
      setFeaturedImage(article.featured_image_url || '')
      setAttachments(article.attachments || [])
      setStatus(article.status)
    } else {
      setTitle('')
      setContent('')
      setFeaturedImage('')
      setAttachments([])
      setStatus('draft')
    }
  }, [article, isOpen])

  const handleSave = async () => {
    if (!title.trim()) {
      return
    }

    setSaving(true)
    try {
      const articleData = {
        title: title.trim(),
        content,
        featured_image_url: featuredImage || null,
        attachments,
        status,
        author_id: authorId,
      }

      await onSave(articleData)
      onClose()
    } catch (error) {
      console.error('Error saving article:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = (url: string, type: 'image' | 'attachment', filename: string) => {
    if (type === 'image') {
      setFeaturedImage(url)
    } else {
      setAttachments(prev => [...prev, { url, filename, type: 'attachment' }])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {article ? 'Edit Article' : 'Create New Article'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter article title..."
            />
            <div className="text-xs text-gray-500 mt-1">
              {title.length}/200 characters
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            {featuredImage ? (
              <div className="relative">
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <FileUpload
                type="image"
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                onFileUpload={handleFileUpload}
              />
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your article content..."
            />
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            
            {attachments.length > 0 && (
              <div className="space-y-2 mb-4">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <File className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{attachment.filename}</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <FileUpload
              type="attachment"
              accept=".pdf,.doc,.docx"
              maxSize={10 * 1024 * 1024}
              onFileUpload={handleFileUpload}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="mr-2"
                />
                Draft
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="published"
                  checked={status === 'published'}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="mr-2"
                />
                Published
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </div>
    </div>
  )
}