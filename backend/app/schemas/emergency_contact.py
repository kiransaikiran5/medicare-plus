from pydantic import BaseModel

class EmergencyContactBase(BaseModel):
    name: str
    relationship: str
    phone: str

class EmergencyContactCreate(EmergencyContactBase):
    pass

class EmergencyContactOut(EmergencyContactBase):
    id: int
    patient_id: int

    class Config:
        from_attributes = True

class HospitalEmergencyInfo(BaseModel):
    hospital_name: str = "MediCare Plus"
    emergency_number: str = "1800-123-4567"
    address: str = "123 Health Avenue, Medical City"