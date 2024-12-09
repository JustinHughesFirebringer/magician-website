export interface Database {
  public: {
    Tables: {
      magicians: {
        Row: {
          id: number;
          name: string;
          slug: string;
          city: string;
          state: string;
          latitude: number;
          longitude: number;
          rating: number | null;
          types: string[] | null;
          working_hours: string | null;
          bio: string | null;
          website_url: string | null;
          photo_1: string | null;
          photo_2: string | null;
          photo_3: string | null;
          photo_4: string | null;
          photo_5: string | null;
          photo_6: string | null;
          photo_7: string | null;
          photo_8: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          slug: string;
          city: string;
          state: string;
          latitude: number;
          longitude: number;
          rating?: number | null;
          types?: string[] | null;
          working_hours?: string | null;
          bio?: string | null;
          website_url?: string | null;
          photo_1?: string | null;
          photo_2?: string | null;
          photo_3?: string | null;
          photo_4?: string | null;
          photo_5?: string | null;
          photo_6?: string | null;
          photo_7?: string | null;
          photo_8?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          slug?: string;
          city?: string;
          state?: string;
          latitude?: number;
          longitude?: number;
          rating?: number | null;
          types?: string[] | null;
          working_hours?: string | null;
          bio?: string | null;
          website_url?: string | null;
          photo_1?: string | null;
          photo_2?: string | null;
          photo_3?: string | null;
          photo_4?: string | null;
          photo_5?: string | null;
          photo_6?: string | null;
          photo_7?: string | null;
          photo_8?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
