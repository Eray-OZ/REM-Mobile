import { router, Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import {
    ActivityIndicator,
    Alert,
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
  const { currentDream, fetchDreamById, deleteDream, isLoading, dreams } = useDreamStore();
  const { t, language } = useTranslation();

  // Try to get dream from cached list first to avoid flashing
  const cachedDream = useMemo(() => {
    return dreams.find(d => d.id === id);
  }, [dreams, id]);

  // Use cached dream or fetched currentDream
  const dream = currentDream || cachedDream;

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
              router.back();
            } else {
              Alert.alert(t('error'), error);
            }
          },
        },
      ]
    );
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

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>NOTES</Text>
          <View style={styles.card}>
            <Text style={styles.dreamContent}>{dream.content}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>INTERPRETATION</Text>
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
});
