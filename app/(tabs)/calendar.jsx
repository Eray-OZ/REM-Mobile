import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { CATEGORY_COLORS, getCategoryIcon } from '../../constants/categories';
import { borderRadius, colors, shadows } from '../../constants/theme';
import { useDreamStore } from '../../store/dreamStore';
import { useTranslation } from '../../store/languageStore';

export default function CalendarScreen() {
  const { dreams } = useDreamStore();
  const { t, language } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(null);

  // Build marked dates from dreams
  const markedDates = useMemo(() => {
    const marks = {};
    
    dreams.forEach((dream) => {
      if (dream.createdAt?.toDate) {
        const date = dream.createdAt.toDate();
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const categoryColor = CATEGORY_COLORS[dream.category] || CATEGORY_COLORS.other;
        
        if (!marks[dateStr]) {
          marks[dateStr] = { dots: [] };
        }
        
        // Add dot for this dream
        marks[dateStr].dots.push({
          key: dream.id,
          color: categoryColor,
        });
      }
    });

    // Add selection styling
    if (selectedDate) {
      if (!marks[selectedDate]) {
        marks[selectedDate] = { dots: [] };
      }
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = colors.primary;
    }

    return marks;
  }, [dreams, selectedDate]);

  // Get dreams for selected date
  const dreamsForDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return dreams.filter((dream) => {
      if (dream.createdAt?.toDate) {
        const date = dream.createdAt.toDate();
        const dateStr = date.toISOString().split('T')[0];
        return dateStr === selectedDate;
      }
      return false;
    });
  }, [dreams, selectedDate]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleDreamPress = (dreamId) => {
    router.push(`/dream/${dreamId}`);
  };

  const renderDreamItem = ({ item }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
    
    return (
      <TouchableOpacity
        style={styles.dreamCard}
        onPress={() => handleDreamPress(item.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[categoryColor, `${categoryColor}99`]}
          style={styles.iconContainer}
        >
          <Text style={styles.iconText}>{getCategoryIcon(item.category)}</Text>
        </LinearGradient>
        <View style={styles.dreamInfo}>
          <Text style={styles.dreamTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.dreamContent} numberOfLines={2}>{item.content}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>JOURNAL</Text>
          <Text style={styles.headerTitle}>{t('tab_calendar')}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.7}
        >
          <FontAwesome name="user-circle" size={28} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>
      
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          calendarBackground: colors.background,
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
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
            'stylesheet.day.basic': {
            base: {
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            },
          },
        }}
        style={styles.calendar}
      />

      <View style={styles.dreamsList}>
        {selectedDate ? (
          dreamsForDate.length > 0 ? (
            <FlatList
              data={dreamsForDate}
              keyExtractor={(item) => item.id}
              renderItem={renderDreamItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('no_dreams_on_day')}</Text>
            </View>
          )
        ) : (
          <View style={styles.hintContainer}>
            <Text style={styles.hintIcon}>👆</Text>
            <Text style={styles.hintText}>
              {language === 'tr' 
                ? 'Rüyalarınızı görmek için bir gün seçin' 
                : 'Select a day to see your dreams'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileButton: {
    padding: 8,
    marginTop: 20,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  calendar: {
    marginHorizontal: 16,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.cardBg,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  dreamsList: {
    flex: 1,
    marginTop: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  dreamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...shadows.card,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 22,
  },
  dreamInfo: {
    flex: 1,
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  dreamContent: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hintContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  hintIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  hintText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
