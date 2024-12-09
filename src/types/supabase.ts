export type SpecialtyType = 
  | 'Close-up Magic'
  | 'Stage Magic'
  | 'Mentalism'
  | 'Children\'s Magic'
  | 'Comedy Magic'
  | 'Illusions'
  | 'Card Magic'
  | 'Street Magic'
  | 'Corporate Magic';

export type AvailabilityType = 
  | 'Weekdays'
  | 'Weekends'
  | 'Evenings'
  | 'Full-time'
  | 'By Appointment';

export interface Database {
  public: {
    Tables: {
      magicians: {
        Row: {
          id: number;
          name: string;
          business_name?: string;
          email?: string;
          phone?: string;
          website_url?: string;
          description?: string;
          price_range_min?: number;
          price_range_max?: number;
          rating?: number;
          review_count?: number;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: number;
          name: string;
          business_name?: string;
          email?: string;
          phone?: string;
          website_url?: string;
          description?: string;
          price_range_min?: number;
          price_range_max?: number;
          rating?: number;
          review_count?: number;
          verified?: boolean;
        };
      };
      magician_locations: {
        Row: {
          id: number;
          magician_id: number;
          address_line1?: string;
          address_line2?: string;
          city: string;
          state: string;
          zip_code?: string;
          latitude?: number;
          longitude?: number;
          service_radius_miles?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Insert: {
          id?: number;
          magician_id: number;
          address_line1?: string;
          address_line2?: string;
          city: string;
          state: string;
          zip_code?: string;
          latitude?: number;
          longitude?: number;
          service_radius_miles?: number;
          is_primary?: boolean;
        };
      };
      magician_specialties: {
        Row: {
          magician_id: number;
          specialty: SpecialtyType;
        };
        Insert: {
          magician_id: number;
          specialty: SpecialtyType;
        };
      };
      magician_availability: {
        Row: {
          magician_id: number;
          availability: AvailabilityType;
        };
        Insert: {
          magician_id: number;
          availability: AvailabilityType;
        };
      };
      shows: {
        Row: {
          id: number;
          magician_id: number;
          title: string;
          description?: string;
          duration_minutes?: number;
          base_price?: number;
          max_audience_size?: number;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: number;
          magician_id: number;
          title: string;
          description?: string;
          duration_minutes?: number;
          base_price?: number;
          max_audience_size?: number;
        };
      };
      reviews: {
        Row: {
          id: number;
          magician_id: number;
          reviewer_name: string;
          rating: number;
          review_text?: string;
          event_date?: string;
          created_at?: string;
        };
        Insert: {
          id?: number;
          magician_id: number;
          reviewer_name: string;
          rating: number;
          review_text?: string;
          event_date?: string;
        };
      };
    };
  };
}

