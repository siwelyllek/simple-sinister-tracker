#!/usr/bin/env python3
"""
Migration script to add workout type fields to existing workouts.
This script updates existing workouts to have:
- swing_workout_type = "EMOM" 
- getup_workout_type = "Standard"
"""

import sqlite3
import os
import sys

# Database path
DATA_DIR = "/app/data"
DB_PATH = f"{DATA_DIR}/workouts.db"

def migrate_workout_types():
    """Add workout type columns and set default values for existing workouts."""
    
    if not os.path.exists(DB_PATH):
        print(f"Database file not found at {DB_PATH}")
        print("Please ensure the application has been run at least once to create the database.")
        return False
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if the new columns already exist
        cursor.execute("PRAGMA table_info(workouts)")
        columns = [column[1] for column in cursor.fetchall()]
        
        workout_type_columns_exist = (
            'swing_workout_type' in columns and 
            'getup_workout_type' in columns
        )
        
        if not workout_type_columns_exist:
            print("Adding workout type columns to workouts table...")
            
            # Add the new columns with default values
            cursor.execute("""
                ALTER TABLE workouts 
                ADD COLUMN swing_workout_type TEXT DEFAULT 'Standard'
            """)
            
            cursor.execute("""
                ALTER TABLE workouts 
                ADD COLUMN getup_workout_type TEXT DEFAULT 'Standard'
            """)
            
            print("✅ Workout type columns added successfully!")
        else:
            print("Workout type columns already exist.")
        
        # Update existing workouts to have the desired values
        print("Updating existing workouts...")
        
        # Set swing_workout_type to "EMOM" for all existing workouts
        cursor.execute("""
            UPDATE workouts 
            SET swing_workout_type = 'EMOM' 
            WHERE swing_workout_type IS NULL OR swing_workout_type = 'Standard'
        """)
        
        # Set getup_workout_type to "Standard" for all existing workouts
        cursor.execute("""
            UPDATE workouts 
            SET getup_workout_type = 'Standard' 
            WHERE getup_workout_type IS NULL
        """)
        
        # Get count of updated rows
        cursor.execute("SELECT COUNT(*) FROM workouts")
        total_workouts = cursor.fetchone()[0]
        
        # Commit the changes
        conn.commit()
        
        print(f"✅ Successfully updated {total_workouts} workouts!")
        print("   - Swing workout type set to: EMOM")
        print("   - Get-up workout type set to: Standard")
        
        # Verify the changes
        cursor.execute("""
            SELECT swing_workout_type, getup_workout_type, COUNT(*) 
            FROM workouts 
            GROUP BY swing_workout_type, getup_workout_type
        """)
        
        print("\nWorkout type distribution:")
        for row in cursor.fetchall():
            swing_type, getup_type, count = row
            print(f"  - {count} workouts: Swings={swing_type}, Get-ups={getup_type}")
        
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if conn:
            conn.close()

def main():
    """Main function to run the migration."""
    print("🔄 Starting workout type migration...")
    print(f"Database location: {DB_PATH}")
    
    success = migrate_workout_types()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("Your existing workouts now have workout types assigned.")
        print("You can restart the application to see the changes.")
    else:
        print("\n❌ Migration failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()