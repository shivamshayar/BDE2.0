from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from api.database import engine, get_db, Base
from api.models import BDEMachine, User, PartNumber, OrderNumber, PerformanceID, WorkSession
from api.schemas import (
    BDEMachineCreate, BDEMachineLogin, BDEMachineResponse, BDEMachinePasswordReset,
    UserCreate, UserUpdate, UserResponse,
    PartNumberCreate, PartNumberResponse,
    OrderNumberCreate, OrderNumberResponse,
    PerformanceIDCreate, PerformanceIDResponse,
    WorkSessionCreate, WorkSessionResponse,
    Token
)
from api.auth import verify_password, get_password_hash, create_access_token
from api.dependencies import get_current_machine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="BDE Work Tracking API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== BDE Machine Endpoints ====================

@app.post("/api/machines/login", response_model=Token)
def login_machine(login_data: BDEMachineLogin, db: Session = Depends(get_db)):
    machine = db.query(BDEMachine).filter(BDEMachine.machine_id == login_data.machine_id).first()
    
    if not machine or not verify_password(login_data.password, machine.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid machine ID or password"
        )
    
    if not machine.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Machine is inactive"
        )
    
    # Update last login
    machine.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": machine.machine_id})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "machine_id": machine.machine_id
    }

@app.post("/api/machines", response_model=BDEMachineResponse)
def create_machine(
    machine_data: BDEMachineCreate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    # Check if machine ID already exists
    existing = db.query(BDEMachine).filter(BDEMachine.machine_id == machine_data.machine_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Machine ID already exists"
        )
    
    hashed_password = get_password_hash(machine_data.password)
    
    new_machine = BDEMachine(
        machine_id=machine_data.machine_id,
        password_hash=hashed_password
    )
    
    db.add(new_machine)
    db.commit()
    db.refresh(new_machine)
    
    return new_machine

@app.get("/api/machines", response_model=List[BDEMachineResponse])
def get_machines(
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    machines = db.query(BDEMachine).filter(BDEMachine.is_active == True).all()
    return machines

@app.put("/api/machines/{machine_id}/reset-password", response_model=BDEMachineResponse)
def reset_machine_password(
    machine_id: int, 
    reset_data: BDEMachinePasswordReset, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    machine = db.query(BDEMachine).filter(BDEMachine.id == machine_id).first()
    
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found"
        )
    
    machine.password_hash = get_password_hash(reset_data.new_password)
    db.commit()
    db.refresh(machine)
    
    return machine

@app.delete("/api/machines/{machine_id}")
def delete_machine(
    machine_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    machine = db.query(BDEMachine).filter(BDEMachine.id == machine_id).first()
    
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found"
        )
    
    machine.is_active = False
    db.commit()
    
    return {"message": "Machine deleted successfully"}

# ==================== User Endpoints ====================

@app.post("/api/users", response_model=UserResponse)
def create_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    new_user = User(**user_data.model_dump())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/api/users", response_model=List[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    users = db.query(User).filter(User.is_active == True).all()
    return users

@app.get("/api/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int, 
    user_data: UserUpdate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for key, value in user_data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

@app.delete("/api/users/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    db.commit()
    return {"message": "User deleted successfully"}

# ==================== Part Number Endpoints ====================

@app.post("/api/part-numbers", response_model=PartNumberResponse)
def create_part_number(
    data: PartNumberCreate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    # Check if part number already exists
    existing = db.query(PartNumber).filter(PartNumber.part_number == data.part_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Part number already exists")
    
    new_part = PartNumber(**data.model_dump())
    db.add(new_part)
    db.commit()
    db.refresh(new_part)
    return new_part

@app.get("/api/part-numbers", response_model=List[PartNumberResponse])
def get_part_numbers(
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    return db.query(PartNumber).filter(PartNumber.is_active == True).all()

@app.delete("/api/part-numbers/{part_id}")
def delete_part_number(
    part_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    part = db.query(PartNumber).filter(PartNumber.id == part_id).first()
    if not part:
        raise HTTPException(status_code=404, detail="Part number not found")
    
    part.is_active = False
    db.commit()
    return {"message": "Part number deleted successfully"}

# ==================== Order Number Endpoints ====================

@app.post("/api/order-numbers", response_model=OrderNumberResponse)
def create_order_number(
    data: OrderNumberCreate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    existing = db.query(OrderNumber).filter(OrderNumber.order_number == data.order_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Order number already exists")
    
    new_order = OrderNumber(**data.model_dump())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/api/order-numbers", response_model=List[OrderNumberResponse])
def get_order_numbers(
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    return db.query(OrderNumber).filter(OrderNumber.is_active == True).all()

@app.delete("/api/order-numbers/{order_id}")
def delete_order_number(
    order_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    order = db.query(OrderNumber).filter(OrderNumber.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order number not found")
    
    order.is_active = False
    db.commit()
    return {"message": "Order number deleted successfully"}

# ==================== Performance ID Endpoints ====================

@app.post("/api/performance-ids", response_model=PerformanceIDResponse)
def create_performance_id(
    data: PerformanceIDCreate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    existing = db.query(PerformanceID).filter(PerformanceID.performance_id == data.performance_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Performance ID already exists")
    
    new_perf = PerformanceID(**data.model_dump())
    db.add(new_perf)
    db.commit()
    db.refresh(new_perf)
    return new_perf

@app.get("/api/performance-ids", response_model=List[PerformanceIDResponse])
def get_performance_ids(
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    return db.query(PerformanceID).filter(PerformanceID.is_active == True).all()

@app.delete("/api/performance-ids/{perf_id}")
def delete_performance_id(
    perf_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    perf = db.query(PerformanceID).filter(PerformanceID.id == perf_id).first()
    if not perf:
        raise HTTPException(status_code=404, detail="Performance ID not found")
    
    perf.is_active = False
    db.commit()
    return {"message": "Performance ID deleted successfully"}

# ==================== Work Session Endpoints ====================

@app.post("/api/work-sessions", response_model=WorkSessionResponse)
def create_work_session(
    data: WorkSessionCreate, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    # Use authenticated machine ID
    new_session = WorkSession(
        **data.model_dump(),
        machine_id=current_machine.id
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@app.get("/api/work-sessions", response_model=List[WorkSessionResponse])
def get_work_sessions(
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    return db.query(WorkSession).all()

@app.get("/api/work-sessions/user/{user_id}", response_model=List[WorkSessionResponse])
def get_user_work_sessions(
    user_id: int, 
    db: Session = Depends(get_db),
    current_machine: BDEMachine = Depends(get_current_machine)
):
    return db.query(WorkSession).filter(WorkSession.user_id == user_id).all()

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
