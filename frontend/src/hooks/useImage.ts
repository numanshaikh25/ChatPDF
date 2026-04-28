import { useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { imageApi } from '@/lib/api-client'
import type { ImageChatRequest } from '@/types/image'

export const imageKeys = {
  all: ['images'] as const,
  lists: () => [...imageKeys.all, 'list'] as const,
  list: () => [...imageKeys.lists()] as const,
  details: () => [...imageKeys.all, 'detail'] as const,
  detail: (id: string) => [...imageKeys.details(), id] as const,
  chatHistories: () => [...imageKeys.all, 'chat-history'] as const,
  chatHistory: (id: string) => [...imageKeys.chatHistories(), id] as const,
}

export function useImageList() {
  return useQuery({
    queryKey: imageKeys.list(),
    queryFn: () => imageApi.list(),
  })
}

export function useImageDetail(imageId: string | null) {
  return useQuery({
    queryKey: imageKeys.detail(imageId || ''),
    queryFn: () => imageApi.getStatus(imageId!),
    enabled: !!imageId,
  })
}

export function useUploadImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => imageApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.lists() })
    },
  })
}

export function useDeleteImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => imageApi.delete(imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.all })
    },
  })
}

export function useImageChatHistory(imageId: string | null) {
  return useQuery({
    queryKey: imageKeys.chatHistory(imageId || ''),
    queryFn: () => imageApi.getChatHistory(imageId!),
    enabled: !!imageId,
  })
}

export function useSendImageMessage() {
  const queryClient = useQueryClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const mutation = useMutation({
    mutationFn: (request: ImageChatRequest) => {
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller
      return imageApi.chat(request, controller.signal)
    },
    onSuccess: (_, variables) => {
      abortControllerRef.current = null
      queryClient.invalidateQueries({
        queryKey: imageKeys.chatHistory(variables.image_id),
      })
    },
    onError: () => {
      abortControllerRef.current = null
    },
  })

  const cancel = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }

  return { ...mutation, cancel }
}
