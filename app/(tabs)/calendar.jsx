import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { SwipeableDreamItem } from '../../components/SwipeableDreamItem';
import { useAuthStore } from '../../store/authStore';
import { CATEGORY_COLORS, getCategoryIcon } from '../../constants/categories';
import { borderRadius, colors, shadows } from '../../constants/theme';
import { useDreamStore } from '../../store/dreamStore';
import { useTranslation } from '../../store/languageStore';

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const { dreams, deleteDream } = useDreamStore();
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

  const handleDelete = (dreamId) => {
    Alert.alert(
      t('delete_dream'),
      t('delete_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
             await deleteDream(user?.uid, dreamId);
             // Verify if we need to update state, but store update should trigger re-render
          },
        },
      ]
    );
  };

  const renderDreamItem = ({ item }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other;
    
    return (
      <SwipeableDreamItem onDelete={() => handleDelete(item.id)}>
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
      </SwipeableDreamItem>
    );
  };

  // Custom Day Component for "Glaze" effect
  const CustomDay = ({ date, state, marking }) => {
    const isSelected = marking?.selected;
    const hasDreams = marking?.dots?.length > 0;
    const isToday = state === 'today';
    const isDisabled = state === 'disabled';
    
    // Base container style
    let containerStyle = styles.dayContainer;
    let textStyle = styles.dayText;
    
    // Selection style overrides everything
    if (isSelected) {
      // handled by wrapper logic below
      textStyle = styles.selectedDayText;
    } else if (isToday) {
      textStyle = styles.todayText;
    } else if (isDisabled) {
      textStyle = styles.disabledText;
    }
    
    const content = (
      <View style={{ alignItems: 'center', justifyContent: 'center', width: 36, height: 36 }}>
        <Text style={textStyle}>{date.day}</Text>
        
        {/* Render Dots */}
        <View style={styles.dotsContainer}>
          {marking?.dots?.map((dot, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                { backgroundColor: isSelected ? '#fff' : dot.color }
              ]} 
            />
          ))}
        </View>
      </View>
    );

    if (isSelected) {
      return (
        <TouchableOpacity onPress={() => handleDayPress(date)} activeOpacity={0.7}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.dayContainer, styles.selectedDayContainer]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (hasDreams) {
      // Determine color based on first dot or default to primary
      const primaryDotColor = marking?.dots?.[0]?.color || colors.primary;
      
      return (
        <TouchableOpacity onPress={() => handleDayPress(date)} activeOpacity={0.7}>
          <LinearGradient
            // Make it more colorful/glazed by using the category color with transparency
            // or a brighter glass gradient
            colors={[`${primaryDotColor}CC`, `${primaryDotColor}66`]} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.dayContainer, styles.glazedDayContainer, { borderColor: `${primaryDotColor}CC` }]}
          >
            {content}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity 
        onPress={() => handleDayPress(date)} 
        activeOpacity={0.7}
        disabled={isDisabled}
        style={styles.dayContainer}
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        dayComponent={CustomDay}
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          calendarBackground: colors.cardBg,
          textSectionTitleColor: colors.textSecondary,
          monthTextColor: colors.text,
          arrowColor: colors.primary,
          textMonthFontWeight: '800',
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
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
    </GestureHandlerRootView>
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
  // Day Component Styles
  dayContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  glazedDayContainer: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedDayContainer: {
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  dayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  todayText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textMuted,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
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
