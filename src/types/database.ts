export interface Database {
  public: {
    Tables: {
      magicians: {
        Row: {
          id: string;
          name: string;
          business_name: string | null;
          email: string | null;
          phone: string | null;
          website_url: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          business_name?: string | null;
          email?: string | null;
          phone?: string | null;
          website_url?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          business_name?: string | null;
          email?: string | null;
          phone?: string | null;
          website_url?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      magician_locations: {
        Row: {
          id: string;
          magician_id: string;
          address: string | null;
          city: string;
          state: string;
          postal_code: string | null;
          latitude: number;
          longitude: number;
          service_radius_miles: number;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          magician_id: string;
          address?: string | null;
          city: string;
          state: string;
          postal_code?: string | null;
          latitude: number;
          longitude: number;
          service_radius_miles: number;
          is_primary: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          magician_id?: string;
          address?: string | null;
          city?: string;
          state?: string;
          postal_code?: string | null;
          latitude?: number;
          longitude?: number;
          service_radius_miles?: number;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      magician_availability: {
        Row: {
          id: string;
          magician_id: string;
          availability: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          magician_id: string;
          availability: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          magician_id?: string;
          availability?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
