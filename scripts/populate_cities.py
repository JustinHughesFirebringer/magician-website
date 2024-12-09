import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def process_cities():
    """
    Process the local cities CSV and insert into Supabase
    """
    try:
        # Read the CSV file
        df = pd.read_csv('data/uscities.csv')
        
        # Transform the data
        cities_data = []
        for _, row in df.iterrows():
            cities_data.append({
                "city": row['city'].lower(),  # Convert city to lowercase
                "state": row['state'].upper()  # Ensure state is uppercase
            })
        
        print(f"Found {len(cities_data)} cities")
        
        # Insert data in batches
        batch_size = 1000
        for i in range(0, len(cities_data), batch_size):
            batch = cities_data[i:i + batch_size]
            response = supabase.table("us_cities").upsert(batch).execute()
            print(f"Inserted batch {i//batch_size + 1} of {(len(cities_data) + batch_size - 1)//batch_size}")
        
        return True
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    print("Processing cities data...")
    if process_cities():
        print("Cities data has been successfully populated!")
    else:
        print("Failed to process cities data.")

if __name__ == "__main__":
    main()
