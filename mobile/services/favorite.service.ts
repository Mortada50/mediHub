import api from "../lib/axios";

export const favoriteService = {
  getFavorites: async (itemType: string): Promise<string[]> => {
    try {
      const response: any = await api.get(`/api/favorites?itemType=${itemType}`);
      // response is the data object containing { data: [{item: "id", itemType: "..."}] }
      // The controller returns: sendSuccess(res, favorites, ...) => { success: true, data: favorites, message: ... }
      // Axios interceptor returns res.data
      const favoritesList = response.data || [];
      return favoritesList.map((fav: any) => fav.item);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  toggleFavorite: async (itemId: string, itemType: string): Promise<boolean> => {
    try {
      const response: any = await api.post("/api/favorites/toggle", {
        itemId,
        itemType,
      });
      // Returns { data: { isFavorite: boolean } }
      return response.data?.isFavorite ?? false;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  },
};
