import { useArticlesApi } from "../services/api.js";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useArticles = () => {
  const queryClient = useQueryClient();
  const { addNewArticle, getArticles, updateArticle,toggleIsFeaturedStatus ,deleteArticle} = useArticlesApi();

  const {
    data: articlesData,
    isError,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["articles"],
    queryFn: () => getArticles(),
  });

  const addNewArticleMutation = useMutation({
    mutationFn: (data) => addNewArticle(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
  });

  const updateArticleMutation = useMutation({
    mutationFn: (data) => updateArticle(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
  });

  const toggleIsFeaturedStatusMutation = useMutation({
    mutationFn: (articleId) => toggleIsFeaturedStatus(articleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (articleId) => deleteArticle(articleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["articles"] }),
  });

  return {
    articlesData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,

    addNewArticleMutation: addNewArticleMutation.mutate,
    isAddingNewArticleLoading: addNewArticleMutation.isLoading,
    isAddingNewArticleError: addNewArticleMutation.isError,
    addNewArticleError: addNewArticleMutation.error,

    updateArticleMutation: updateArticleMutation.mutate,
    isUpdateingArticleLoading: updateArticleMutation.isLoading,
    isUpdateingArticleError: updateArticleMutation.isError,
    updateArticleError: updateArticleMutation.error,

    toggleIsFeaturedStatusMutation: toggleIsFeaturedStatusMutation.mutate,
    isToggleIsFeaturedStatusLoading: toggleIsFeaturedStatusMutation.isLoading,
    isToggleIsFeaturedStatusError: toggleIsFeaturedStatusMutation.isError,
    toggleIsFeaturedStatusError: toggleIsFeaturedStatusMutation.error,

    deleteArticleMutation: deleteArticleMutation.mutate,
    isDeleteingArticleLoading: deleteArticleMutation.isLoading,
    isDeleteingArticleError: deleteArticleMutation.isError,
    deleteArticleError: deleteArticleMutation.error,
  };
};
