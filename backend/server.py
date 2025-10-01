from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import csv
import io
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import json
import random


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="MFA Monitoring Dashboard", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Data Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str
    department: str
    mfa_status: str  # "Enabled" or "Not Enabled"
    mfa_methods: List[str] = []
    breached: bool
    breach_sources: List[str] = []
    last_login: datetime
    suspicious_logins: int = 0
    risk_score: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserDetail(User):
    login_history: List[Dict[str, Any]] = []
    breach_history: List[Dict[str, Any]] = []
    risk_breakdown: Dict[str, int] = {}

class Stats(BaseModel):
    total_users: int
    mfa_enabled: int
    mfa_disabled: int
    mfa_percentage: float
    breached_users: int
    breach_percentage: float
    avg_risk_score: float
    high_risk_users: int

class MaltegoBreach(BaseModel):
    email: str
    breached: bool
    sources: List[str]

class MaltegoMFA(BaseModel):
    email: str
    mfa_status: str
    methods: List[str]

class MaltegoRisk(BaseModel):
    email: str
    risk_score: int
    risk_level: str

# Mock Data Generation
def generate_mock_users() -> List[User]:
    """Generate realistic mock user data"""
    departments = ["IT", "Finance", "HR", "Marketing", "Sales", "Operations", "Legal", "Engineering"]
    roles = ["Admin", "Manager", "User", "Finance Manager", "HR Director", "IT Specialist", "Sales Rep"]
    privileged_roles = ["Admin", "Finance Manager", "HR Director", "IT Specialist"]
    
    first_names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack",
                   "Kate", "Liam", "Maya", "Noah", "Olivia", "Paul", "Quinn", "Ruby", "Sam", "Tara"]
    last_names = ["Anderson", "Brown", "Clark", "Davis", "Evans", "Fisher", "Garcia", "Harris", 
                  "Johnson", "King", "Lewis", "Miller", "Nelson", "Parker", "Quinn", "Roberts", "Smith", "Taylor"]
    
    users = []
    
    for i in range(50):  # Generate 50 users
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        email = f"{first_name.lower()}.{last_name.lower()}@halmstad.se"
        name = f"{first_name} {last_name}"
        role = random.choice(roles)
        department = random.choice(departments)
        
        # MFA status (80% have MFA enabled)
        mfa_enabled = random.random() < 0.8
        mfa_status = "Enabled" if mfa_enabled else "Not Enabled"
        mfa_methods = []
        if mfa_enabled:
            methods = ["Authenticator App", "SMS", "Hardware Token", "Email"]
            mfa_methods = random.sample(methods, random.randint(1, 3))
        
        # Breach status (20% have been breached)
        breached = random.random() < 0.2
        breach_sources = []
        if breached:
            sources = ["LinkedIn", "Adobe", "Dropbox", "Yahoo", "Equifax", "Facebook"]
            breach_sources = random.sample(sources, random.randint(1, 3))
        
        # Last login (within last 30 days)
        days_ago = random.randint(0, 30)
        hours_ago = random.randint(0, 23)
        last_login = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=hours_ago)
        
        # Suspicious logins
        suspicious_logins = random.randint(0, 5) if random.random() < 0.3 else 0
        
        # Calculate risk score
        risk_score = 0
        if not mfa_enabled:
            risk_score += 30
        if breached:
            risk_score += 25
        if role in privileged_roles:
            risk_score += 40
        if suspicious_logins > 0:
            risk_score += 20
        
        # Add some randomness
        risk_score += random.randint(-5, 15)
        risk_score = max(0, min(100, risk_score))  # Clamp between 0-100
        
        user = User(
            email=email,
            name=name,
            role=role,
            department=department,
            mfa_status=mfa_status,
            mfa_methods=mfa_methods,
            breached=breached,
            breach_sources=breach_sources,
            last_login=last_login,
            suspicious_logins=suspicious_logins,
            risk_score=risk_score
        )
        users.append(user)
    
    return users

# Generate mock data
mock_users = generate_mock_users()

# API Endpoints
@api_router.get("/users", response_model=List[User])
async def get_users(
    search: Optional[str] = Query(None, description="Search by email or name"),
    department: Optional[str] = Query(None, description="Filter by department"),
    mfa_status: Optional[str] = Query(None, description="Filter by MFA status"),
    min_risk: Optional[int] = Query(None, description="Minimum risk score"),
    max_risk: Optional[int] = Query(None, description="Maximum risk score")
):
    """Get all users with optional filtering"""
    filtered_users = mock_users.copy()
    
    if search:
        search_lower = search.lower()
        filtered_users = [u for u in filtered_users if 
                         search_lower in u.email.lower() or search_lower in u.name.lower()]
    
    if department:
        filtered_users = [u for u in filtered_users if u.department == department]
    
    if mfa_status:
        filtered_users = [u for u in filtered_users if u.mfa_status == mfa_status]
    
    if min_risk is not None:
        filtered_users = [u for u in filtered_users if u.risk_score >= min_risk]
    
    if max_risk is not None:
        filtered_users = [u for u in filtered_users if u.risk_score <= max_risk]
    
    return filtered_users

@api_router.get("/users/{email}", response_model=UserDetail)
async def get_user_detail(email: str):
    """Get detailed user information"""
    user = next((u for u in mock_users if u.email == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate mock detailed data
    login_history = []
    for i in range(10):
        days_ago = random.randint(1, 30)
        login_history.append({
            "timestamp": (datetime.now(timezone.utc) - timedelta(days=days_ago)).isoformat(),
            "ip_address": f"192.168.{random.randint(1,255)}.{random.randint(1,255)}",
            "location": random.choice(["Stockholm, Sweden", "Gothenburg, Sweden", "Malmö, Sweden", "Unknown"]),
            "suspicious": random.random() < 0.1
        })
    
    breach_history = []
    if user.breached:
        for source in user.breach_sources:
            breach_history.append({
                "source": source,
                "date": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 365))).isoformat(),
                "type": random.choice(["Email", "Password", "Personal Info"])
            })
    
    risk_breakdown = {
        "mfa_disabled": 30 if user.mfa_status == "Not Enabled" else 0,
        "breach_exposure": 25 if user.breached else 0,
        "privileged_role": 40 if user.role in ["Admin", "Finance Manager", "HR Director", "IT Specialist"] else 0,
        "suspicious_activity": 20 if user.suspicious_logins > 0 else 0
    }
    
    user_detail = UserDetail(
        **user.dict(),
        login_history=login_history,
        breach_history=breach_history,
        risk_breakdown=risk_breakdown
    )
    
    return user_detail

@api_router.get("/stats", response_model=Stats)
async def get_stats():
    """Get MFA coverage and risk statistics"""
    total_users = len(mock_users)
    mfa_enabled = len([u for u in mock_users if u.mfa_status == "Enabled"])
    mfa_disabled = total_users - mfa_enabled
    mfa_percentage = (mfa_enabled / total_users) * 100 if total_users > 0 else 0
    
    breached_users = len([u for u in mock_users if u.breached])
    breach_percentage = (breached_users / total_users) * 100 if total_users > 0 else 0
    
    avg_risk_score = sum(u.risk_score for u in mock_users) / total_users if total_users > 0 else 0
    high_risk_users = len([u for u in mock_users if u.risk_score >= 70])
    
    return Stats(
        total_users=total_users,
        mfa_enabled=mfa_enabled,
        mfa_disabled=mfa_disabled,
        mfa_percentage=round(mfa_percentage, 2),
        breached_users=breached_users,
        breach_percentage=round(breach_percentage, 2),
        avg_risk_score=round(avg_risk_score, 2),
        high_risk_users=high_risk_users
    )

@api_router.get("/breach/{email}")
async def get_breach_info(email: str):
    """Get breach information for specific email"""
    user = next((u for u in mock_users if u.email == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": email,
        "breached": user.breached,
        "sources": user.breach_sources,
        "last_checked": datetime.now(timezone.utc).isoformat()
    }

# Export endpoints
@api_router.get("/export/csv")
async def export_csv(
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    mfa_status: Optional[str] = Query(None)
):
    """Export filtered users as CSV"""
    # Get filtered users (reuse filtering logic)
    filtered_users = mock_users.copy()
    
    if search:
        search_lower = search.lower()
        filtered_users = [u for u in filtered_users if 
                         search_lower in u.email.lower() or search_lower in u.name.lower()]
    
    if department:
        filtered_users = [u for u in filtered_users if u.department == department]
    
    if mfa_status:
        filtered_users = [u for u in filtered_users if u.mfa_status == mfa_status]
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Email', 'Name', 'Role', 'Department', 'MFA Status', 'Breached', 'Last Login', 'Risk Score'])
    
    # Data
    for user in filtered_users:
        writer.writerow([
            user.email,
            user.name,
            user.role,
            user.department,
            user.mfa_status,
            'Yes' if user.breached else 'No',
            user.last_login.strftime('%Y-%m-%d %H:%M:%S'),
            user.risk_score
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mfa_users_export.csv"}
    )

# Maltego Transform Endpoints
@api_router.get("/maltego/mfa/{email}", response_model=MaltegoMFA)
async def maltego_mfa_status(email: str):
    """Maltego transform: Email -> MFA Status"""
    user = next((u for u in mock_users if u.email == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return MaltegoMFA(
        email=email,
        mfa_status=user.mfa_status,
        methods=user.mfa_methods
    )

@api_router.get("/maltego/breach/{email}", response_model=MaltegoBreach)
async def maltego_breach_status(email: str):
    """Maltego transform: Email -> Breach Exposure"""
    user = next((u for u in mock_users if u.email == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return MaltegoBreach(
        email=email,
        breached=user.breached,
        sources=user.breach_sources
    )

@api_router.get("/maltego/risk/{email}", response_model=MaltegoRisk)
async def maltego_risk_score(email: str):
    """Maltego transform: Email -> Risk Score"""
    user = next((u for u in mock_users if u.email == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    risk_level = "Low"
    if user.risk_score >= 70:
        risk_level = "High"
    elif user.risk_score >= 40:
        risk_level = "Medium"
    
    return MaltegoRisk(
        email=email,
        risk_score=user.risk_score,
        risk_level=risk_level
    )

@api_router.get("/maltego/logins/{email}")
async def maltego_suspicious_logins(email: str):
    """Maltego transform: Email -> Suspicious Logins"""
    user = next((u for u in mock_users if u.email == email), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": email,
        "suspicious_logins": user.suspicious_logins,
        "last_login": user.last_login.isoformat(),
        "status": "suspicious" if user.suspicious_logins > 0 else "normal"
    }

# Analytics endpoints
@api_router.get("/analytics/mfa-trend")
async def get_mfa_trend():
    """Get MFA adoption trend over time (mock data)"""
    trend_data = []
    base_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    for i in range(30):
        date = base_date + timedelta(days=i)
        # Simulate gradual MFA adoption
        percentage = min(85, 60 + (i * 0.8) + random.uniform(-5, 5))
        trend_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "mfa_percentage": round(percentage, 2)
        })
    
    return trend_data

@api_router.get("/analytics/top-risks")
async def get_top_risks():
    """Get top 10 risky accounts"""
    sorted_users = sorted(mock_users, key=lambda u: u.risk_score, reverse=True)[:10]
    
    return [{
        "email": user.email,
        "name": user.name,
        "risk_score": user.risk_score,
        "department": user.department
    } for user in sorted_users]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()