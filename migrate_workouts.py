#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Host migration script to add workout type fields to existing workouts.
Run this from the host machine to update your Docker volume database.
"""

import sqlite3
import os
import sys

def find_database():
    """Find the database file in Docker volume or local directory."""
    possible_paths = [
        # Docker volume path (if accessible)
        "./backend/data/workouts.db",
        # Local development path
        "./data/workouts.db",
        # Docker Desktop volume path (Windows)
        os.path.expanduser("~/.docker/volumes/simple-sinister-tracker_workoutdata/_data/workouts.db"),
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    return None

def migrate_workout_types(db_path):
    """Add workout type columns and set default values for existing workouts."""
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
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
            
            print("[SUCCESS] Workout type columns added successfully!")
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
        
        print("[SUCCESS] Successfully updated {} workouts!".format(total_workouts))
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
            print("  - {} workouts: Swings={}, Get-ups={}".format(count, swing_type, getup_type))
        
        return True
        
    except sqlite3.Error as e:
        print("[ERROR] Database error: {}".format(e))
        return False
    except Exception as e:
        print("[ERROR] Unexpected error: {}".format(e))
        return False
    finally:
        if conn:
            conn.close()

def main():
    """Main function to run the migration."""
    print("Starting workout type migration...")
    
    # Find the database file
    db_path = find_database()
    
    if not db_path:
        print("[ERROR] Could not find the workout database file.")
        print("Please ensure:")
        print("1. Docker containers are running")
        print("2. You have created at least one workout")
        print("3. You're running this from the project root directory")
        sys.exit(1)
    
    print("Found database at: {}".format(db_path))
    
    success = migrate_workout_types(db_path)
    
    if success:
        print("\n[SUCCESS] Migration completed successfully!")
        print("Your existing workouts now have workout types assigned.")
        print("Refresh your browser to see the changes.")
    else:
        print("\n[ERROR] Migration failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()