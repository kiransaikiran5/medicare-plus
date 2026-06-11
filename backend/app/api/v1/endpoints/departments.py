from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.department import Department
from app.models.doctor import Doctor
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut, DepartmentStats

router = APIRouter()

# Public: list all departments
@router.get("/", response_model=List[DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Department).all()

# Admin: create department
@router.post("/", response_model=DepartmentOut, status_code=201)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    # check if name already exists
    existing = db.query(Department).filter(Department.name == department.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department name already exists")
    new_dept = Department(**department.dict())
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return new_dept

# Admin: update department
@router.put("/{dept_id}", response_model=DepartmentOut)
def update_department(
    dept_id: int,
    update: DepartmentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    update_data = update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return dept

# Admin: delete department
@router.delete("/{dept_id}", status_code=204)
def delete_department(
    dept_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    # optional: set doctors' department_id to null
    doctors = db.query(Doctor).filter(Doctor.department_id == dept_id).all()
    for doc in doctors:
        doc.department_id = None
    db.delete(dept)
    db.commit()
    return None

# Admin: get department statistics
@router.get("/{dept_id}/statistics", response_model=DepartmentStats)
def department_statistics(
    dept_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN"))
):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    doctor_count = db.query(Doctor).filter(Doctor.department_id == dept_id).count()
    return {
        "id": dept.id,
        "name": dept.name,
        "doctor_count": doctor_count
    }