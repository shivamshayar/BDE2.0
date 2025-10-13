from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from api.database import get_db
from api.auth import verify_token
from api.models import BDEMachine

security = HTTPBearer()

async def get_current_machine(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> BDEMachine:
    """Verify JWT token and return the authenticated machine"""
    token = credentials.credentials
    machine_id = verify_token(token)
    
    if not machine_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    machine = db.query(BDEMachine).filter(BDEMachine.machine_id == machine_id).first()
    
    if not machine or not machine.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Machine not found or inactive"
        )
    
    return machine
