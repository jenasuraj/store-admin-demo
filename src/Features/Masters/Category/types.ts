export interface Category {
  id: number;
  categoryName: string;
  parentId: number;
}

export interface SubCategory {
  id: string;
  categoryId: number;
  categoryName: string;
  parentCategoryName: string;
  parentId: number;
}

export interface CategoryList {
  categories: Category[] | null;
  loading: boolean;
  error: boolean;
  subCategories: null | SubCategory[];
  subCategoriesloading: boolean;
  subCategorieserror: boolean;
}
