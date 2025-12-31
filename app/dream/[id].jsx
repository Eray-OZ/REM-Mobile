import { router, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CATEGORIES } from '../../constants/categories';
import { borderRadius, colors, shadows, spacing } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useDreamStore } from '../../store/dreamStore';
import { useTranslation } from '../../store/languageStore';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { currentDream, fetchDreamById, deleteDream, generateDreamImage, isLoading, dreams } = useDreamStore();
  const { t, language } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine which dream to display
  const dream = useMemo(() => {
    // If currentDream matches the requested ID, use it (most up to date)
    if (currentDream && currentDream.id === id) {
        return currentDream;
    }
    // Otherwise try to find it in the list (instant load)
    return dreams.find(d => d.id === id);
  }, [currentDream, dreams, id]);

  // Clear previous dream on mount/change if it doesn't match
  useEffect(() => {
    if (currentDream && currentDream.id !== id) {
        useDreamStore.getState().clearCurrentDream();
    }
  }, [id]);

  useEffect(() => {
    if (user?.uid && id) {
      fetchDreamById(user.uid, id);
    }
  }, [user?.uid, id]);

  const handleDelete = () => {
    Alert.alert(
      t('delete_dream'),
      t('delete_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteDream(user.uid, id);
            if (!error) {
              // Use replace to ensure we land on a valid route
              router.replace('/(tabs)');
            } else {
              Alert.alert(t('error'), error);
            }
          },
        },
      ]
    );
  };

  const handleVisualize = async () => {
    setIsGenerating(true);
    const { success, error } = await generateDreamImage(user.uid, id, dream.content);
    setIsGenerating(false);
    
    if (!success) {
        Alert.alert(t('error') || 'Error', error);
    }
  };

  // Only show loading if we have no dream data at all
  if (isLoading && !dream) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('dream_not_found')}</Text>
      </View>
    );
  }

  const categoryLabel = t(CATEGORIES.find(c => c.id === dream.category)?.labelKey || 'cat_other');

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
          headerShadowVisible: false, // Ensure smooth transition
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
            <Text style={styles.title}>{dream.title}</Text>
            <View style={styles.dateContainer}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.date}>
                    {dream.createdAt?.toDate?.()?.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    }) || t('unknown_date')}
                </Text>
            </View>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>

        {dream.imageUrl ? (
            <View style={styles.imageContainer}>
                <Image source={{ uri: dream.imageUrl }} style={styles.dreamImage} resizeMode="cover" />
            </View>
        ) : (
            <TouchableOpacity 
                style={styles.visualizeButton}
                onPress={handleVisualize}
                disabled={isGenerating}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.visualizeGradient}
                >
                    {isGenerating ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.visualizeIcon}>🎨</Text>
                            <Text style={styles.visualizeText}>{t('visualize_dream') || 'Visualize Dream'}</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.dreamContent}>{dream.content}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.analysisBorder}
          >
            <View style={styles.analysisInner}>
                <View style={styles.analysisHeader}>
                    <Text style={styles.analysisIcon}>✨</Text>
                    <Text style={styles.analysisTitle}>{t('ai_analysis')}</Text>
                </View>
                <Text style={styles.analysisText}>{dream.analysis}</Text>
            </View>
          </LinearGradient>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>🗑️ {t('delete_dream')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    paddingBottom: 24,
  },
  categoryText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 40,
  },
  dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  dateIcon: {
      fontSize: 14,
      marginRight: 8,
      opacity: 0.7,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeading: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.textMuted,
      marginBottom: 12,
      letterSpacing: 2,
      paddingLeft: 4,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  dreamContent: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 28,
    fontWeight: '400',
  },
  analysisBorder: {
      borderRadius: borderRadius.xl,
      padding: 1, // Gradient border width
  },
  analysisInner: {
      backgroundColor: 'rgba(15, 7, 32, 0.95)', // Slightly opaque to show gradient behind but readable
      borderRadius: borderRadius.xl - 1,
      padding: 24,
  },
  analysisHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
  },
  analysisIcon: {
      fontSize: 20,
      marginRight: 8,
  },
  analysisTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
  },
  analysisText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 28,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.full,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 8,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  visualizeButton: {
    marginBottom: 32,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  visualizeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  visualizeIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  visualizeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  dreamImage: {
    width: '100%',
    height: '100%',
  },
});
