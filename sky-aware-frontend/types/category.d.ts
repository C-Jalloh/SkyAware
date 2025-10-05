export interface Category {
  name: string;
  range: string;
  color: string;
}

export interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}
