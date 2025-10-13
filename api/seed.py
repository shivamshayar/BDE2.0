from api.database import SessionLocal, engine, Base
from api.models import BDEMachine, User, PartNumber, OrderNumber, PerformanceID
from api.auth import get_password_hash

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(BDEMachine).first():
            print("Database already seeded!")
            return
        
        # Seed BDE Machines
        machines = [
            BDEMachine(machine_id="MACHINE-001", password_hash=get_password_hash("pass123")),
            BDEMachine(machine_id="MACHINE-002", password_hash=get_password_hash("pass123")),
            BDEMachine(machine_id="MACHINE-003", password_hash=get_password_hash("pass123")),
        ]
        db.add_all(machines)
        
        # Seed Users
        users = [
            User(
                name="John Smith",
                role="Assembly Operator",
                image_url="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400"
            ),
            User(
                name="Sarah Johnson",
                role="Quality Inspector",
                image_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
            ),
            User(
                name="Mike Chen",
                role="Machine Operator",
                image_url="https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=400"
            ),
            User(
                name="Emily Davis",
                role="Line Supervisor",
                image_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400"
            ),
        ]
        db.add_all(users)
        
        # Seed Part Numbers
        part_numbers = [
            PartNumber(part_number="PN-1001", description="Widget Assembly A"),
            PartNumber(part_number="PN-1002", description="Component B"),
            PartNumber(part_number="PN-1003", description="Circuit Board C"),
            PartNumber(part_number="PN-1004", description="Housing Unit D"),
            PartNumber(part_number="PN-1005", description="Motor Assembly E"),
        ]
        db.add_all(part_numbers)
        
        # Seed Order Numbers
        order_numbers = [
            OrderNumber(order_number="ORD-2024-001", description="Production Batch Jan"),
            OrderNumber(order_number="ORD-2024-002", description="Production Batch Feb"),
            OrderNumber(order_number="ORD-2024-003", description="Production Batch Mar"),
            OrderNumber(order_number="ORD-2024-004", description="Production Batch Apr"),
        ]
        db.add_all(order_numbers)
        
        # Seed Performance IDs
        performance_ids = [
            PerformanceID(performance_id="PERF-A", description="Standard Performance"),
            PerformanceID(performance_id="PERF-B", description="High Performance"),
            PerformanceID(performance_id="PERF-C", description="Quality Check"),
            PerformanceID(performance_id="PERF-D", description="Maintenance Mode"),
        ]
        db.add_all(performance_ids)
        
        db.commit()
        print("Database seeded successfully!")
        print("\nTest Credentials:")
        print("Machine ID: MACHINE-001")
        print("Password: pass123")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
