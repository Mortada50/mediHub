import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Clock, User } from "lucide-react-native";

export type Article = {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  author: string;
  timeAgo: string;
  image?: any;
};

type ArticleCardProps = {
  article: Article;
  onPress?: () => void;
};

const CARD_HEIGHT = 220;

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="rounded-3xl overflow-hidden"
      style={{
        height: CARD_HEIGHT,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      {/* Cover Image — only rendered if image is provided */}
      {article.image ? (
        <Image
          source={article.image}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="absolute w-full h-full bg-[#2B9C8E]" />
      )}

      {/* Dark overlay */}
      <View className="absolute inset-0 bg-[rgba(15,30,40,0.55)]" />

      {/* Category Badge */}
      <View
        className="absolute top-4 left-4 px-3 py-1.5 rounded-[14px]"
        style={{ backgroundColor: article.categoryColor }}
      >
        <Text className="text-white text-xs" style={{ fontFamily: "Bein" }}>
          {article.category}
        </Text>
      </View>

      {/* Bottom Content */}
      <View className="absolute bottom-0 left-0 right-0 p-5">
        <Text
          numberOfLines={2}
          className="text-white text-[18px] mb-3 text-left leading-7"
          style={{ fontFamily: "Bein-Black" }}
        >
          {article.title}
        </Text>

        <View className="flex-row gap-4">
          <View className="flex-row items-center gap-1.5">
            <User size={12} color="rgba(255,255,255,0.75)" />
            <Text className="text-xs text-white/85" style={{ fontFamily: "Bein" }}>
              {article.author}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock size={12} color="rgba(255,255,255,0.75)" />
            <Text className="text-xs text-white/85" style={{ fontFamily: "Bein" }}>
              {article.timeAgo}
            </Text>
          </View>

        </View>
      </View>
    </TouchableOpacity>
  );
};