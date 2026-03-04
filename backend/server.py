from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
from google.oauth2 import service_account
from googleapiclient.discovery import build
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Google Sheets configuration
GOOGLE_SHEETS_CREDENTIALS = os.environ.get('GOOGLE_SHEETS_CREDENTIALS', '')
SPREADSHEET_ID = os.environ.get('SPREADSHEET_ID', '')

# Resend API configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL', 'ogrisko54@gmail.com')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Define Models
class InquiryCreate(BaseModel):
    name: str
    email: EmailStr
    service_type: str
    project_description: str
    budget: Optional[str] = None
    timeline: Optional[str] = None

class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    service_type: str
    project_description: str
    budget: Optional[str] = None
    timeline: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"


def fix_private_key(private_key: str) -> str:
    """Fix private key by ensuring proper newlines"""
    # If the key has literal \n (escaped), replace with actual newlines
    if '\\n' in private_key:
        private_key = private_key.replace('\\n', '\n')
    # Also handle case where it might be double-escaped
    if '\\\\n' in private_key:
        private_key = private_key.replace('\\\\n', '\n')
    return private_key


def get_sheets_service():
    """Create Google Sheets service using service account credentials"""
    try:
        if not GOOGLE_SHEETS_CREDENTIALS:
            logger.warning("Google Sheets credentials not configured")
            return None
        
        logger.info(f"Parsing Google Sheets credentials (length: {len(GOOGLE_SHEETS_CREDENTIALS)})")
        
        # Parse JSON credentials
        creds_dict = json.loads(GOOGLE_SHEETS_CREDENTIALS)
        
        # Fix private key newlines
        if 'private_key' in creds_dict:
            original_key = creds_dict['private_key']
            creds_dict['private_key'] = fix_private_key(original_key)
            if original_key != creds_dict['private_key']:
                logger.info("Fixed private key newlines")
        
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        service = build('sheets', 'v4', credentials=credentials, cache_discovery=False)
        logger.info("Google Sheets service created successfully")
        return service
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in credentials: {e}")
        return None
    except Exception as e:
        logger.error(f"Failed to create Sheets service: {e}")
        return None


async def append_to_sheets(inquiry: Inquiry):
    """Append inquiry data to Google Sheets"""
    try:
        if not SPREADSHEET_ID:
            logger.warning("Spreadsheet ID not configured")
            return False
            
        service = get_sheets_service()
        if not service:
            logger.error("Could not create Sheets service")
            return False
        
        # Get first sheet name
        try:
            spreadsheet = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
            sheet_name = spreadsheet['sheets'][0]['properties']['title']
            logger.info(f"Using sheet: {sheet_name}")
        except Exception as e:
            logger.error(f"Could not get sheet name: {e}")
            sheet_name = "Лист1"  # Default Russian name
        
        row = [[
            inquiry.name,
            inquiry.email,
            inquiry.service_type,
            inquiry.project_description,
            inquiry.budget or '',
            inquiry.timeline or '',
            inquiry.timestamp.isoformat()
        ]]
        
        result = service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{sheet_name}'!A:G",
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body={'values': row}
        ).execute()
        
        logger.info(f"Added inquiry to Google Sheets: {inquiry.id}, result: {result.get('updates', {}).get('updatedRows', 0)} rows")
        return True
    except Exception as e:
        logger.error(f"Failed to append to sheets: {e}")
        return False


async def send_email_via_resend(inquiry: Inquiry):
    """Send email notification via Resend API"""
    try:
        if not RESEND_API_KEY:
            logger.warning("Resend API key not configured")
            return False
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #050505; color: #F5F5F5; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border-radius: 12px; padding: 30px; border: 1px solid #D4AF37;">
                <h1 style="color: #D4AF37; text-align: center; margin-top: 0;">ROSHKA STUDIO</h1>
                <p style="text-align: center; color: #A3A3A3; margin-bottom: 30px;">New Project Inquiry</p>
                <hr style="border: none; border-top: 1px solid #D4AF37; margin: 20px 0;">
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Client Name:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.name}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Email:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.email}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Service Type:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.service_type}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Project Description:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.project_description}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Budget:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.budget or 'Not specified'}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Timeline:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.timeline or 'Not specified'}</p>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <strong style="color: #D4AF37;">Submitted:</strong>
                    <p style="margin: 5px 0; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px;">{inquiry.timestamp.strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                </div>
                
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0 20px;">
                <p style="text-align: center; color: #A3A3A3; font-size: 12px; margin-bottom: 0;">
                    This email was sent automatically from your ROSHKA STUDIO website.
                </p>
            </div>
        </body>
        </html>
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "ROSHKA STUDIO <onboarding@resend.dev>",
                    "to": [NOTIFICATION_EMAIL],
                    "subject": f"New Project Inquiry from {inquiry.name} - ROSHKA STUDIO",
                    "html": html_content
                }
            )
            
            if response.status_code == 200:
                logger.info(f"Email sent successfully via Resend for inquiry: {inquiry.id}")
                return True
            else:
                logger.error(f"Resend API error: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to send email via Resend: {e}")
        return False


async def send_thank_you_email(inquiry: Inquiry):
    """Send thank you email to the client"""
    try:
        if not RESEND_API_KEY:
            logger.warning("Resend API key not configured")
            return False
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #050505; color: #F5F5F5; padding: 20px; margin: 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border-radius: 12px; padding: 40px; border: 1px solid #D4AF37;">
                <h1 style="color: #D4AF37; text-align: center; margin-top: 0; font-size: 32px;">ROSHKA STUDIO</h1>
                <p style="text-align: center; color: #A3A3A3; margin-bottom: 30px; font-size: 14px;">Creative Web Studio</p>
                
                <hr style="border: none; border-top: 1px solid #D4AF37; margin: 20px 0;">
                
                <h2 style="color: #F5F5F5; text-align: center; font-size: 24px; margin-bottom: 20px;">Thank You, {inquiry.name}!</h2>
                
                <p style="color: #A3A3A3; line-height: 1.8; text-align: center; font-size: 16px;">
                    We have received your project inquiry and we're excited to learn more about your vision!
                </p>
                
                <div style="background: rgba(212, 175, 55, 0.1); border-radius: 12px; padding: 25px; margin: 30px 0; border: 1px solid rgba(212, 175, 55, 0.3);">
                    <h3 style="color: #D4AF37; margin-top: 0; font-size: 18px;">Your Request Summary:</h3>
                    <p style="color: #F5F5F5; margin: 10px 0;"><strong>Service:</strong> {inquiry.service_type}</p>
                    <p style="color: #F5F5F5; margin: 10px 0;"><strong>Budget:</strong> {inquiry.budget or 'To be discussed'}</p>
                    <p style="color: #F5F5F5; margin: 10px 0;"><strong>Timeline:</strong> {inquiry.timeline or 'Flexible'}</p>
                </div>
                
                <p style="color: #A3A3A3; line-height: 1.8; text-align: center; font-size: 16px;">
                    Our team will review your request and get back to you within <strong style="color: #D4AF37;">24 hours</strong>.
                </p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="mailto:ogrisko54@gmail.com" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F6E27A 50%, #B8860B 100%); color: #050505; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Contact Us Directly</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 30px 0 20px;">
                
                <p style="text-align: center; color: #A3A3A3; font-size: 12px; margin-bottom: 5px;">
                    ROSHKA STUDIO | Silver Spring, MD
                </p>
                <p style="text-align: center; color: #A3A3A3; font-size: 12px; margin-bottom: 0;">
                    ogrisko54@gmail.com
                </p>
            </div>
        </body>
        </html>
        """
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "ROSHKA STUDIO <onboarding@resend.dev>",
                    "to": [inquiry.email],
                    "subject": f"Thank You for Your Inquiry - ROSHKA STUDIO",
                    "html": html_content
                }
            )
            
            if response.status_code == 200:
                logger.info(f"Thank you email sent to client: {inquiry.email}")
                return True
            else:
                logger.error(f"Failed to send thank you email: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Failed to send thank you email: {e}")
        return False


# API Routes
@api_router.get("/")
async def root():
    return {"message": "ROSHKA STUDIO API"}


@api_router.post("/inquiries", response_model=Inquiry, status_code=201)
async def create_inquiry(input: InquiryCreate, background_tasks: BackgroundTasks):
    """Submit a new project inquiry"""
    try:
        inquiry = Inquiry(
            name=input.name,
            email=input.email,
            service_type=input.service_type,
            project_description=input.project_description,
            budget=input.budget,
            timeline=input.timeline
        )
        
        # Save to MongoDB
        doc = inquiry.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.inquiries.insert_one(doc)
        
        # Add background tasks for Google Sheets and email
        background_tasks.add_task(append_to_sheets, inquiry)
        background_tasks.add_task(send_email_via_resend, inquiry)
        background_tasks.add_task(send_thank_you_email, inquiry)
        
        logger.info(f"New inquiry created: {inquiry.id}")
        return inquiry
        
    except Exception as e:
        logger.error(f"Error creating inquiry: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit inquiry")


@api_router.get("/inquiries", response_model=List[Inquiry])
async def get_inquiries(skip: int = 0, limit: int = 50):
    """Get inquiries with pagination (for admin purposes)"""
    inquiries = await db.inquiries.find({}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)
    for inquiry in inquiries:
        if isinstance(inquiry.get('timestamp'), str):
            inquiry['timestamp'] = datetime.fromisoformat(inquiry['timestamp'])
    return inquiries


@api_router.get("/services")
async def get_services():
    """Get available services"""
    services = [
        {
            "id": "business-website",
            "title": "Business Website",
            "description": "Custom-designed professional websites that elevate your brand and convert visitors into clients.",
            "features": ["Custom Design", "Mobile Responsive", "SEO Optimized", "Contact Forms"]
        },
        {
            "id": "landing-page",
            "title": "Landing Page",
            "description": "High-converting landing pages designed to capture leads and drive specific actions.",
            "features": ["Conversion Focused", "A/B Testing Ready", "Fast Loading", "Analytics Integration"]
        },
        {
            "id": "e-commerce",
            "title": "E-commerce",
            "description": "Full-featured online stores with secure payments and inventory management.",
            "features": ["Product Catalog", "Secure Checkout", "Inventory System", "Order Management"]
        },
        {
            "id": "redesign",
            "title": "Website Redesign",
            "description": "Transform your outdated website into a modern, high-performing digital experience.",
            "features": ["UX Audit", "Modern Design", "Performance Boost", "Content Migration"]
        },
        {
            "id": "custom-project",
            "title": "Custom Project",
            "description": "Unique digital solutions tailored to your specific business needs and goals.",
            "features": ["Custom Features", "API Integration", "Scalable Architecture", "Full Support"]
        }
    ]
    return services


@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "sheets_configured": bool(GOOGLE_SHEETS_CREDENTIALS and SPREADSHEET_ID),
        "email_configured": bool(RESEND_API_KEY),
        "notification_email": NOTIFICATION_EMAIL
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
