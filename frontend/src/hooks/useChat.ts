import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/api-client";
import type { ChatQueryRequest } from "@/types/chat";

// Query keys
export const chatKeys = {
  all: ["chat"] as const,
  histories: () => [...chatKeys.all, "history"] as const,
  history: (pdfId: string) => [...chatKeys.histories(), pdfId] as const,
};

// Get chat history
export function useChatHistory(pdfId: string | null) {
  return useQuery({
    queryKey: chatKeys.history(pdfId || ""),
    queryFn: () => chatApi.getHistory(pdfId!),
    enabled: !!pdfId,
  });
}

// Send chat message — supports aborting the in-flight request
export function useSendMessage() {
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: (request: ChatQueryRequest) => {
      // Cancel any previous in-flight request
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      return chatApi.query(request, controller.signal);
    },
    onSuccess: (_, variables) => {
      abortControllerRef.current = null;
      queryClient.invalidateQueries({
        queryKey: chatKeys.history(variables.pdf_id),
      });
    },
    onError: () => {
      abortControllerRef.current = null;
    },
  });

  const cancel = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  };

  return { ...mutation, cancel };
}
