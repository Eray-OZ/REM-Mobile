import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
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
import { borderRadius, colors, shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useDreamStore } from '../../store/dreamStore';
import { useTranslation } from '../../store/languageStore';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { currentDream, fetchDreamById, deleteDream, isLoading, clearCurrentDream } = useDreamStore();
  const { t, language } = useTranslation();

  useEffect(() => {
    if (user?.uid && id) {
      fetchDreamById(user.uid, id);
    }

    return () => {
      clearCurrentDream();
    };
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentDream) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('dream_not_found')}</Text>
      </View>
    );
  }

  const categoryLabel = t(CATEGORIES.find(c => c.id === currentDream.category)?.labelKey || 'cat_other');

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{currentDream.title}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          <Text style={styles.date}>
            {currentDream.createdAt?.toDate?.()?.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }) || t('unknown_date')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 {t('dream')}</Text>
          <View style={styles.card}>
            <Text style={styles.dreamContent}>{currentDream.content}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 {t('ai_analysis')}</Text>
          <View style={[styles.card, styles.analysisCard]}>
            <Text style={styles.analysisText}>{currentDream.analysis}</Text>
          </View>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  categoryBadge: {
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    color: colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xxl,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  dreamContent: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  analysisCard: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  analysisText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  deleteButton: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    marginTop: 12,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
