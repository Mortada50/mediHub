import { useArticleApi } from "../services/api.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const useArticles = () => {
    const { getArticles, addNewArticle, updateArticle, deleteArticle } = useArticleApi();
    const queryClient = useQueryClient();

    const {data: articles, isLoading, isError, error, refetch, isFetching} = useQuery({
        queryKey: ['articles'],
        queryFn: () => getArticles()

    })

    const addNewArticleMutation = useMutation({
      mutationFn: (data) => addNewArticle(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
    });

    const updateArticleMutation = useMutation({
      mutationFn: (data) => updateArticle(data),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["articles"] }),
    });

      const deleteArticleMutation = useMutation({
        mutationFn: (articleId) => deleteArticle(articleId),
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["articles"] }),
      });


    return {
      articles,
      isLoading,
      isError,
      error,
      refetch,
      isFetching,

      addNewArticleMutation: addNewArticleMutation.mutate,
      isAddingNewArticleLoading: addNewArticleMutation.isLoading,
      isAddingNewArticleError: addNewArticleMutation.isError,
      addNewArticleError: addNewArticleMutation.error,

      updateArticleMutation: updateArticleMutation.mutate,
      isUpdateingArticleLoading: updateArticleMutation.isLoading,
      isUpdateingArticleError: updateArticleMutation.isError,
      updateArticleError: updateArticleMutation.error,

      deleteArticleMutation: deleteArticleMutation.mutate,
      isDeleteingArticleLoading: deleteArticleMutation.isLoading,
      isDeleteingArticleError: deleteArticleMutation.isError,
      deleteArticleError: deleteArticleMutation.error,
    };
} 