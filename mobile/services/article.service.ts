import api from "../lib/axios";
import { Article } from "../components/ArticleCard";

// Map category names to colors
const CATEGORY_COLORS: Record<string, string> = {
  "الصحة العامة والوقاية": "#2B9C8E",
  "الأمراض والحالات الطبية": "#E11D48",
  "الأدوية والعلاجات": "#7C3AED",
  "التغذية والحمية": "#D97706",
  "اللياقة والنشاط البدني": "#059669",
  "الصحة النفسية": "#DB2777",
  "صحة المرأة": "#EC4899",
  "صحة الرجل": "#3B82F6",
  "صحة الطفل": "#F59E0B",
  "صحة كبار السن": "#6B7280",
  "الصحة الرقمية والتقنية الطبية": "#06B6D4",
  "الأخبار والأبحاث الطبية": "#10B981",
  "التثقيف الطبي": "#8B5CF6",
  "الصحة والجمال": "#F43F5E",
  "الام والطفل": "#F97316",
  "أخرى": "#6B7280",
};

// Format how long ago the article was posted
const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "اليوم";
  if (diffDays === 1) return "منذ يوم";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "منذ أسبوع";
  if (diffWeeks < 4) return `منذ ${diffWeeks} أسابيع`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "منذ شهر";
  return `منذ ${diffMonths} أشهر`;
};

export const articleService = {
  fetchLatestArticles: async (): Promise<Article[]> => {
    try {
      const response: any = await api.get("/api/patient/data/articles");
      const data = response.data || [];

      return data.map((art: any) => ({
        id: art._id || art.id,
        title: art.title || "",
        category: art.category || "أخرى",
        categoryColor: CATEGORY_COLORS[art.category] || "#6B7280",
        author: art.authorName || (art.authorRole === "doctor" ? "طبيب" : "المحرر"),
        timeAgo: timeAgo(art.createdAt),
        image: art.image ? { uri: art.image } : undefined,
      }));
    } catch (error) {
      console.error("Error fetching latest articles:", error);
      throw error;
    }
  },
};
