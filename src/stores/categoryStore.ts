import { type ICategory } from "@/types";
import { acceptHMRUpdate, defineStore } from "pinia";

export const useCategoryStore = defineStore({
    id: 'category',
    state: () => ({
        categories: [] as ICategory[],
        selectedCategory: '',
    }),
    getters: {
        getCategory: (state) => {
            return (catId: string): ICategory | undefined => state.categories.find(c => c.id === catId)
        }
    },
    actions: {
        setCategories(payload: ICategory[]) {
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