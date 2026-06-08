// Auto-generated type definitions matching the Supabase schema.
// Regenerate with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          created_at: string;
          date: string;
          customer: string;
          address: string;
          contact: string;
          delivery_date_time: string | null;
          fulfillment_type: 'Pickup' | 'Meetup' | 'Delivery' | null;
          status: 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
          total: number;
          downpayment: number;
          balance: number;
          delivery_fee: number;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          name: string;
          quantity: number;
          price: number;
          total: number;
          custom_inclusions: string[] | null;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: 'Pending' | 'Preparing' | 'Completed' | 'Cancelled';
      fulfillment_type: 'Pickup' | 'Meetup' | 'Delivery';
    };
  };
};

// Convenience types
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderStatus = Database['public']['Enums']['order_status'];
export type FulfillmentType = Database['public']['Enums']['fulfillment_type'];
