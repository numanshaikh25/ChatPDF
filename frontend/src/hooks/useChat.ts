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

// Send chat message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ChatQueryRequest) => chatApi.query(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.history(variables.pdf_id),
      });
    },
  });
}
