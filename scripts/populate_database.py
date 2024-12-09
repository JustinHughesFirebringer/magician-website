import pandas as pd
import numpy as np
from supabase import create_client, Client
import os
import json

# Supabase credentials from .env.example
SUPABASE_URL = 'https://siukegkcregepkwqiora.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdWtlZ2tjcmVnZXBrd3Fpb3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDk4MjYsImV4cCI6MjA0OTE4NTgyNn0.MDuT_GbDGLqYmxj8FFLFc0fD1Z5gqcBIgtGG3yuzu0o'

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_value(value):
    """Clean a value by handling NaN and None"""
    if pd.isna(value) or value is None:
        return None
    return str(value).strip()

def prepare_record(record):
    """Prepare a record by mapping CSV data to Supabase table columns"""
    data = {
        "name": clean_value(record.get("name")),
        "city": clean_value(record.get("city")),
        "state": clean_value(record.get("state")),
        "latitude": clean_value(record.get("latitude")),
        "longitude": clean_value(record.get("longitude")),
        "photo_1": clean_value(record.get("photo_1"))
    }
    
    # Remove None values
    return {k: v for k, v in data.items() if v is not None}

def main():
    try:
        # Test connection
        print("Testing Supabase connection...")
        try:
            test = supabase.table('magicians').select("*").limit(1).execute()
            print("Successfully connected to Supabase")
        except Exception as e:
            print(f"Error connecting to Supabase: {str(e)}")
            return

        # Load CSV
        csv_file = r"C:\Users\bigre\CascadeProjects\magician-website\data\magicians.csv"
        print(f"Loading CSV file: {csv_file}")
        df = pd.read_csv(csv_file)
        
        print(f"Found {len(df)} total records")
        print(f"Available columns in CSV: {', '.join(df.columns)}")
        
        success_count = 0
        error_count = 0

        # Process each record
        for index, record in df.iterrows():
            try:
                # Clean and prepare the data
                data = prepare_record(record)

                print(f"\nTrying to insert record {index + 1}:")
                print(f"Data: {json.dumps(data, indent=2)}")

                # Insert record
                try:
                    result = supabase.table('magicians').insert(data).execute()
                    
                    if hasattr(result, 'data') and result.data:
                        success_count += 1
                        print(f"Successfully inserted record {index + 1}: {data.get('name', 'Unknown')}")
                    else:
                        error_count += 1
                        print(f"No data returned for record {index + 1}: {data.get('name', 'Unknown')}")
                except Exception as insert_error:
                    error_count += 1
                    print(f"Insert error for record {index + 1}: {str(insert_error)}")

            except Exception as e:
                error_count += 1
                print(f"Error processing record {index + 1}: {str(e)}")
                continue

        # Print summary
        print("\nSummary:")
        print(f"Total records: {len(df)}")
        print(f"Successfully inserted: {success_count}")
        print(f"Errors: {error_count}")

    except Exception as e:
        print(f"Fatal error: {str(e)}")
        raise

if __name__ == "__main__":
    main()
