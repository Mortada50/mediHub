import { useQuery } from "@tanstack/react-query";
import { articleService } from "../services/article.service";
import { Article } from "../components/ArticleCard";

export const useArticles = () => {
  return useQuery<Article[], Error>({
    queryKey: ["latestArticles"],
    queryFn: articleService.fetchLatestArticles,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (articles don't change often)
    retry: 2,
  });
};
