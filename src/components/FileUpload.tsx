import React, { useCallback, useState } from 'react'
import { Upload, X, File, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onFileUpload: (url: string, type: 'image' | 'attachment', filename: string) => void
  accept?: string
  maxSize?: number
  type: 'image' | 'attachment'
}

export function FileUpload({ onFileUpload, accept, maxSize = 5 * 1024 * 1024, type }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = async (file: File) => {
    try {
      setUploading(true)
      
      // Validate file size
      if (file.size > maxSize) {
        toast.error(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`)
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const bucket = type === 'image' ? 'article-images' : 'article-attachments'

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      onFileUpload(publicUrl, type, file.name)
      toast.success('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      uploadFile(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-upload-${type}`}
        disabled={uploading}
      />
      
      <div className="flex flex-col items-center">
        {type === 'image' ? (
          <Image className="h-12 w-12 text-gray-400 mb-4" />
        ) : (
          <File className="h-12 w-12 text-gray-400 mb-4" />
        )}
        
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Drop your {type} here, or{' '}
              <label
                htmlFor={`file-upload-${type}`}
                className="text-indigo-600 hover:text-indigo-500 cursor-pointer font-medium"
              >
                browse
              </label>
            </p>
            <p className="text-xs text-gray-500">
              {accept} • Max {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}