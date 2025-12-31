import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { CATEGORIES } from '../../constants/categories';
import { borderRadius, colors, shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useDreamStore } from '../../store/dreamStore';
import { useTranslation } from '../../store/languageStore';

export default function AddDreamScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { user } = useAuthStore();
  const { addDream, isLoading } = useDreamStore();
  const { t, language } = useTranslation();

  const selectableCategories = CATEGORIES.filter(c => c.id !== 'all');

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert(t('error'), t('enter_title'));
      return;
    }

    if (!content.trim()) {
      Alert.alert(t('error'), t('enter_dream'));
      return;
    }

    if (content.trim().length < 20) {
      Alert.alert(t('error'), t('dream_too_short'));
      return;
    }

    // If selected date is today, pass null to use serverTimestamp() which includes time.
    // Otherwise use selected date (which will be 00:00:00 of that day).
    const today = new Date().toISOString().split('T')[0];
    const dateToSubmit = selectedDate === today ? null : selectedDate;

    const { id, error } = await addDream(
      user.uid, 
      title.trim(), 
      content.trim(), 
      selectedCategory, 
      language,
      dateToSubmit
    );

    if (id) {
      // Reset form
      setTitle('');
      setContent('');
      setSelectedCategory('other');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      // Navigate directly to the new dream's detail page
      router.push(`/dream/${id}`);
    } else if (error) {
      Alert.alert(t('error'), error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>✨</Text>
          <Text style={styles.headerTitle}>{t('new_dream')}</Text>
          <Text style={styles.subtitle}>{t('add_dream_subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('dream_title')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('dream_title_placeholder')}
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Date Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{language === 'tr' ? 'Tarih' : 'Date'}</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('category')}</Text>
            <View style={styles.categoryGrid}>
              {selectableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === cat.id && styles.categoryOptionActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryOptionIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      selectedCategory === cat.id && styles.categoryOptionTextActive,
                    ]}
                  >
                    {t(cat.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('your_dream')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('dream_content_placeholder')}
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length} {t('characters')}</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.loadingText}>{t('analyzing')}</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>{t('save_and_analyze')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 {t('tips')}</Text>
          <Text style={styles.tipText}>• {t('tip_1')}</Text>
          <Text style={styles.tipText}>• {t('tip_2')}</Text>
          <Text style={styles.tipText}>• {t('tip_3')}</Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <Calendar
              current={selectedDate}
              markedDates={{
                [selectedDate]: { selected: true, selectedColor: colors.primary }
              }}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setShowDatePicker(false);
              }}
              maxDate={new Date().toISOString().split('T')[0]} // Can't select future dates
              theme={{
                calendarBackground: colors.cardBg,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: colors.secondary,
                dayTextColor: colors.text,
                textDisabledColor: colors.textMuted,
                monthTextColor: colors.text,
                arrowColor: colors.primary,
                textDayFontWeight: '600',
                textMonthFontWeight: '800',
                textDayHeaderFontWeight: '600',
              }}
              style={styles.modalCalendar}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.xl,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryOptionActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    ...shadows.button,
  },
  categoryOptionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: colors.text,
  },
  textArea: {
    minHeight: 160,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.xl,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    ...shadows.button,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: colors.text,
    fontSize: 16,
  },
  tips: {
    marginTop: 32,
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
  },
  modalCalendar: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
});
