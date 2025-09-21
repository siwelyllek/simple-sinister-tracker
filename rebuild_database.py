#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Database rebuild script for Simple & Sinister Tracker.
This script will recreate the database with the new schema including workout types.
Run this to start fresh with a clean database.
"""

import sqlite3
import os
import sys

def find_database_location():
    """Find where the database should be located."""
    possible_paths = [
        # Docker volume path (if accessible)
        "./backend/data/workouts.db",
        # Local development path
        "./data/workouts.db",
        # Current directory
        "./workouts.db"
    ]
    
    # Return the first path that has a directory we can write to
    for path in possible_paths:
        directory = os.path.dirname(path)
        if directory == "":
            directory = "."
        if os.path.exists(directory) or directory == ".":
            return path
    
    # Default to current directory
    return "./workouts.db"

def rebuild_database():
    """Rebuild the database with the new schema."""
    
    db_path = find_database_location()
    
    # Remove existing database if it exists
    if os.path.exists(db_path):
        print("Removing existing database: {}".format(db_path))
        os.remove(db_path)
    
    print("Creating new database: {}".format(db_path))
    
    try:
        # Connect to SQLite database (this will create it)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create the workouts table with the new schema
        cursor.execute("""
            CREATE TABLE workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                kettlebell_swings INTEGER NOT NULL,
                turkish_get_ups INTEGER NOT NULL,
                swing_weight_kg REAL NOT NULL,
                getup_weight_1_kg REAL NOT NULL,
                getup_reps_1 INTEGER NOT NULL,
                getup_weight_2_kg REAL,
                getup_reps_2 INTEGER NOT NULL DEFAULT 0,
                swing_workout_type TEXT NOT NULL DEFAULT 'Standard',
                getup_workout_type TEXT NOT NULL DEFAULT 'Standard'
            )
        """)
        
        # Create an index on the date for better performance
        cursor.execute("""
            CREATE INDEX idx_workouts_date ON workouts(date)
        """)
        
        # Commit the changes
        conn.commit()
        
        print("[SUCCESS] Database created successfully!")
        print("Schema includes:")
        print("  - All original workout fields")
        print("  - swing_workout_type (EMOM/Standard)")
        print("  - getup_workout_type (EMOM/Standard)")
        print("")
        print("You can now start the application and begin tracking workouts.")
        
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
    """Main function to rebuild the database."""
    print("Simple & Sinister Database Rebuild")
    print("=" * 40)
    print("This will create a fresh database with the new workout type schema.")
    print("WARNING: This will delete any existing workout data!")
    print("")
    
    # Ask for confirmation
    response = input("Do you want to continue? (y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("Operation cancelled.")
        return
    
    success = rebuild_database()
    
    if success:
        print("\n[SUCCESS] Database rebuild completed!")
        print("You can now restart your Docker containers and start tracking workouts.")
    else:
        print("\n[ERROR] Database rebuild failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()