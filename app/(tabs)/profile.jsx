import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { borderRadius, colors, shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../store/languageStore';

export default function ProfileScreen() {
  const { user, signOut, isLoading } = useAuthStore();
  const { t, language, setLanguage, getLanguages } = useTranslation();
  const languages = getLanguages();

  const handleSignOut = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={[styles.pageTitle, { color: colors.primaryLight }]}>{t('tab_profile')}</Text>
      
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email || t('unknown_user')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('account')}</Text>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📧</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>{t('email')}</Text>
            <Text style={styles.menuValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>📅</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>{t('registration_date')}</Text>
            <Text style={styles.menuValue}>
              {user?.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')
                : t('unknown')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('language')}</Text>
        <View style={styles.languageContainer}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                language === lang.code && styles.languageOptionActive,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  language === lang.code && styles.languageNameActive,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('app')}</Text>
        
        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>🌙</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>{t('app_name')}</Text>
            <Text style={styles.menuValue}>v1.0.0</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.signOutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
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
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 24,
    marginTop: 16,
  },
  titleUnderline: {
      position: 'absolute',
      bottom: -4,
      left: 0,
      width: '100%',
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.xxl,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.button,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  email: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  languageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  languageOptionActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
    ...shadows.button,
  },
  languageFlag: {
    fontSize: 24,
  },
  languageName: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  languageNameActive: {
    color: colors.text,
  },
  signOutButton: {
    backgroundColor: colors.danger,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  signOutText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
