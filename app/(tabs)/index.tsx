import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES, getCategoryIcon } from '../../constants/categories';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useDreamStore } from '../../store/dreamStore';
import { useTranslation } from '../../store/languageStore';

export default function DreamListScreen() {
  const { user } = useAuthStore();
  const {
    isLoading,
    fetchDreams,
    selectedCategory,
    setCategory,
    searchQuery,
    setSearchQuery,
    getFilteredDreams,
  } = useDreamStore();
  const { t, language } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchDreams(user.uid);
    }
  }, [user?.uid]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.uid) {
      await fetchDreams(user.uid);
    }
    setRefreshing(false);
  };

  const filteredDreams = getFilteredDreams();

  // Helper to get gradient colors based on category
  const getGradientColors = (categoryId: string): [string, string] => {
    switch (categoryId) {
      case 'fear': return ['#EF4444', '#B91C1C'];
      case 'relationship': return ['#EC4899', '#BE185D'];
      case 'work': return ['#8B5CF6', '#7C3AED'];
      case 'adventure': return ['#06B6D4', '#0891B2']; // Cyan for adventure
      default: return ['#6366F1', '#4338CA'];
    }
  };

  const renderDreamCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.dreamCardWrapper}
      onPress={() => router.push(`/dream/${item.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.dreamCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <LinearGradient
              colors={getGradientColors(item.category)}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.iconText}>{getCategoryIcon(item.category)}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.dreamTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <View style={styles.dateContainer}>
                 <View style={[styles.dateDot, { backgroundColor: getGradientColors(item.category)[0] }]} />
                 <Text style={[styles.dreamDate, { color: getGradientColors(item.category)[0] + 'AA' }]}>
                  {item.createdAt?.toDate?.()?.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric' }) || t('no_date')}
                 </Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.categoryBadge, { backgroundColor: getGradientColors(item.category)[0] + '20', borderColor: getGradientColors(item.category)[0] + '40' }]}>
            <Text style={[styles.categoryBadgeText, { color: getGradientColors(item.category)[0] }]}>
              {t(CATEGORIES.find(c => c.id === item.category)?.labelKey || 'cat_other')}
            </Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.dreamContent} numberOfLines={2}>
            {item.content}
          </Text>
        </View>


      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <View style={styles.categoryContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
            const isActive = item.id === 'all' ? !selectedCategory : selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setCategory(item.id === 'all' ? null : item.id)}
                activeOpacity={0.7}
              >
                  {isActive ? (
                      <LinearGradient
                          colors={[colors.primary, colors.secondary]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={[styles.categoryChip, styles.categoryChipActive]}
                      >
                           <Text style={styles.categoryChipIcon}>{item.icon}</Text>
                           <Text style={[styles.categoryChipText, styles.categoryChipTextActive]}>
                              {t(item.labelKey)}
                           </Text>
                      </LinearGradient>
                  ) : (
                      <View style={styles.categoryChip}>
                           <Text style={styles.categoryChipIcon}>{item.icon}</Text>
                           <Text style={styles.categoryChipText}>
                              {t(item.labelKey)}
                           </Text>
                      </View>
                  )}
              </TouchableOpacity>
            );
        }}
        contentContainerStyle={styles.categoryList}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Visual Header matching design.html */}
      <View style={styles.header}>
        <View>
            <Text style={styles.eyebrow}>JOURNAL</Text>
            <View style={styles.titleRow}>
                <Text style={styles.headerTitle}>
                    My <Text style={{ color: 'transparent' }}>Dreams</Text> 
                </Text>
                {/* Text Gradient simulation for "Dreams" */}
                <View style={styles.textGradientOverlay}>
                     <Text style={[styles.headerTitle, { opacity: 0 }]}>My </Text>
                     <Text style={[styles.headerTitle, { color: colors.secondary }]}>Dreams</Text>
                </View>

            </View>
        </View>

      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>
      </View>

      {renderCategoryFilter()}

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredDreams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💭</Text>
          <Text style={styles.emptyText}>{t('no_dreams')}</Text>
          <Text style={styles.emptySubtext}>{t('no_dreams_hint')}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDreams}
          keyExtractor={(item) => item.id}
          renderItem={renderDreamCard}
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900', // Heavy font weight
    color: '#fff',
    letterSpacing: -1,
  },
  textGradientOverlay: {
      position: 'absolute',
      flexDirection: 'row',
      top: 0,
      left: 0,
      pointerEvents: 'none',
  },


  searchSection: {
      paddingHorizontal: 24,
      marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    height: 56,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },

  categoryContainer: {
    marginBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent', // Initially transparent
  },
  categoryChipActive: {
    borderWidth: 0, // Gradient has no border
    ...shadows.glow,
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryChipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for tab bar
    backgroundColor: colors.background,
  },
  dreamCardWrapper: {
      marginBottom: 20,
  },
  dreamCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xxxl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconText: {
    fontSize: 28,
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '800', // Extra bold
    color: colors.text,
    marginBottom: 4,
  },
  dateContainer: {
     flexDirection: 'row',
     alignItems: 'center',
  },
  dateDot: {
      width: 6, 
      height: 6, 
      borderRadius: 3, 
      marginRight: 6,
  },
  dreamDate: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentContainer: {
      marginTop: 0,
  },
  dreamContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },

});
