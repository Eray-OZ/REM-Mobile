import { create } from 'zustand';
import * as aiService from '../services/ai.service';
import * as dreamService from '../services/dream.service';

export const useDreamStore = create((set, get) => ({
  dreams: [],
  currentDream: null,
  isLoading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',

  // Fetch all dreams
  fetchDreams: async (userId) => {
    set({ isLoading: true, error: null });
    const { dreams, error } = await dreamService.getDreams(userId);
    set({ dreams, isLoading: false, error });
    return { dreams, error };
  },

  // Fetch single dream
  fetchDreamById: async (userId, dreamId) => {
    set({ isLoading: true, error: null });
    const { dream, error } = await dreamService.getDreamById(userId, dreamId);
    set({ currentDream: dream, isLoading: false, error });
    return { dream, error };
  },

  // Add new dream with AI analysis
  addDream: async (userId, title, content, category, language = 'tr', dreamDate = null) => {
    set({ isLoading: true, error: null });

    try {
      // Process dream with AI (only analysis, no auto-categorization)
      const { analysis, error: aiError } = await aiService.analyzeDream(content, language);

      if (aiError && analysis === null) {
        set({ isLoading: false, error: aiError });
        return { id: null, error: aiError };
      }

      // Determine fallback text based on language
      const fallbackAnalysis = language === 'tr' ? 'Analiz yapılamadı' : 'Analysis could not be performed';

      // Save to Firestore with user-selected category and date
      const dreamData = {
        title,
        content,
        analysis: analysis || fallbackAnalysis,
        category: category || 'other',
        dreamDate, // Will be null if not provided, service handles this
      };

      const { id, error } = await dreamService.addDream(userId, dreamData);

      if (error) {
        set({ isLoading: false, error });
        return { id: null, error };
      }

      // Refresh dreams list
      await get().fetchDreams(userId);
      set({ isLoading: false });
      return { id, error: null };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { id: null, error: error.message };
    }
  },

  // Delete dream
  deleteDream: async (userId, dreamId) => {
    set({ isLoading: true, error: null });
    const { error } = await dreamService.deleteDream(userId, dreamId);

    if (!error) {
      // Remove from local state
      set((state) => ({
        dreams: state.dreams.filter((d) => d.id !== dreamId),
      }));
    }

    set({ isLoading: false, error });
    return { error };
  },

  // Filter by category
  setCategory: (category) => {
    set({ selectedCategory: category });
  },

  // Set search query
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  // Get filtered dreams
  getFilteredDreams: () => {
    const { dreams, selectedCategory, searchQuery } = get();
    let filtered = [...dreams];

    if (selectedCategory) {
      filtered = filtered.filter((d) => d.category === selectedCategory);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title?.toLowerCase().includes(lowerQuery) ||
          d.content?.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  },

  // Generate AI image for dream
  generateDreamImage: async (userId, dreamId, content) => {
    set({ isLoading: true, error: null });

    const { image, error: aiError } = await aiService.generateDreamImage(content);

    if (aiError) {
      set({ isLoading: false, error: aiError });
      return { success: false, error: aiError };
    }

    // Save image to Firestore
    const { error: dbError } = await dreamService.updateDream(userId, dreamId, {
      imageUrl: image
    });

    if (dbError) {
       set({ isLoading: false, error: dbError });
       return { success: false, error: dbError };
    }

    // Update local state
    const current = get().currentDream;
    if (current && current.id === dreamId) {
        set({ currentDream: { ...current, imageUrl: image } });
    }
    
    // Update list
    set((state) => ({
      dreams: state.dreams.map(d => d.id === dreamId ? { ...d, imageUrl: image } : d)
    }));

    set({ isLoading: false });
    return { success: true, error: null };
  },

  // Clear current dream
  clearCurrentDream: () => set({ currentDream: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
