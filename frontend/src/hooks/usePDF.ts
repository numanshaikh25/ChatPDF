import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pdfApi } from "@/lib/api-client";
import type { PDF } from "@/types/pdf";

// Query keys
export const pdfKeys = {
  all: ["pdfs"] as const,
  lists: () => [...pdfKeys.all, "list"] as const,
  list: () => [...pdfKeys.lists()] as const,
  details: () => [...pdfKeys.all, "detail"] as const,
  detail: (id: string) => [...pdfKeys.details(), id] as const,
  status: (id: string) => [...pdfKeys.all, "status", id] as const,
};

// Get list of PDFs
export function usePDFList() {
  return useQuery({
    queryKey: pdfKeys.list(),
    queryFn: () => pdfApi.list(),
  });
}

// Get PDF status (with polling)
export function usePDFStatus(pdfId: string | null, enabled = true) {
  return useQuery({
    queryKey: pdfKeys.status(pdfId || ""),
    queryFn: () => pdfApi.getStatus(pdfId!),
    enabled: enabled && !!pdfId,
    refetchInterval: (data) => {
      // Poll every 3 seconds if status is pending or processing
      if (data?.status === "pending" || data?.status === "processing" || data?.status === "uploaded") {
        return 3000;
      }
      return false;
    },
  });
}

// Initialize upload
export function useInitUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ filename, fileSize }: { filename: string; fileSize: number }) =>
      pdfApi.initUpload(filename, fileSize),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKeys.lists() });
    },
  });
}

// Delete PDF
export function useDeletePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pdfId: string) => pdfApi.delete(pdfId),
    onSuccess: () => {
      // Invalidate all PDF queries after deletion
      queryClient.invalidateQueries({ queryKey: pdfKeys.all });
    },
  });
}
