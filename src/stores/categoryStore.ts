import { type ICategories } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useCategoryStore = defineStore({
    id: 'category',
    state: () => ({
        categories: [] as ICategories[],
        selectedCategory: '',
    }),
    getters: {
        getCategory: (state) => {
            return (catId: string): ICategories | undefined => state.categories.find(c => c.id === catId)
        }
    },
    actions: {
        setCategories(payload: ICategories[]) {
            this.categories = payload 
        },
        setSelectedCategory(payload: string) {
            this.selectedCategory = payload
        }
    }
})

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useCategoryStore, import.meta.hot))
  }