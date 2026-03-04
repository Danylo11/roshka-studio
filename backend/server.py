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

# Gmail configuration
GMAIL_EMAIL = os.environ.get('GMAIL_EMAIL', '')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')
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
    # Replace escaped newlines with actual newlines
    if '\\n' in private_key:
        private_key = private_key.replace('\\n', '\n')
    return private_key


def get_sheets_service():
    """Create Google Sheets service using service account credentials"""
    try:
        if not GOOGLE_SHEETS_CREDENTIALS:
            logger.warning("Google Sheets credentials not configured")
            return None
        
        # Parse JSON credentials
        creds_dict = json.loads(GOOGLE_SHEETS_CREDENTIALS)
        
        # Fix private key newlines
        if 'private_key' in creds_dict:
            creds_dict['private_key'] = fix_private_key(creds_dict['private_key'])
            logger.info("Fixed private key newlines")
        
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        service = build('sheets', 'v4', credentials=credentials, cache_discovery=False)
        return service
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in credentials: {e}")
        return None
    except Exception as e:
        logger.error(f"Failed to create Sheets service: {e}")
        return None


async def create_spreadsheet_if_needed(service):
    """Create spreadsheet and header row if it doesn't exist"""
    try:
        if not SPREADSHEET_ID:
            logger.warning("Spreadsheet ID not configured")
            return False, None
        
        # Get spreadsheet metadata to find the first sheet name
        spreadsheet = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
        first_sheet_name = spreadsheet['sheets'][0]['properties']['title']
        logger.info(f"Using sheet: {first_sheet_name}")
            
        # Check if spreadsheet has headers
        try:
            result = service.spreadsheets().values().get(
                spreadsheetId=SPREADSHEET_ID,
                range=f"'{first_sheet_name}'!A1:G1"
            ).execute()
            
            values = result.get('values', [])
            if not values:
                # Add headers
                headers = [['Name', 'Email', 'Service Type', 'Project Description', 'Budget', 'Timeline', 'Timestamp']]
                service.spreadsheets().values().update(
                    spreadsheetId=SPREADSHEET_ID,
                    range=f"'{first_sheet_name}'!A1:G1",
                    valueInputOption='RAW',
                    body={'values': headers}
                ).execute()
                logger.info("Created spreadsheet headers")
        except Exception as e:
            logger.warning(f"Could not check headers: {e}")
            
        return True, first_sheet_name
    except Exception as e:
        logger.error(f"Error accessing spreadsheet: {e}")
        return False, None


async def append_to_sheets(inquiry: Inquiry):
    """Append inquiry data to Google Sheets"""
    try:
        service = get_sheets_service()
        if not service:
            logger.error("Could not create Sheets service")
            return False
            
        success, sheet_name = await create_spreadsheet_if_needed(service)
        if not success or not sheet_name:
            logger.error("Could not access spreadsheet")
            return False
        
        row = [[
            inquiry.name,
            inquiry.email,
            inquiry.service_type,
            inquiry.project_description,
            inquiry.budget or '',
            inquiry.timeline or '',
            inquiry.timestamp.isoformat()
        ]]
        
        service.spreadsheets().values().append(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{sheet_name}'!A:G",
            valueInputOption='RAW',
            insertDataOption='INSERT_ROWS',
            body={'values': row}
        ).execute()
        
        logger.info(f"Added inquiry to Google Sheets: {inquiry.id}")
        return True
    except Exception as e:
        logger.error(f"Failed to append to sheets: {e}")
        return False


async def send_email_notification(inquiry: Inquiry):
    """Send email notification via Web3Forms (free, no SMTP needed)"""
    try:
        # Use Web3Forms free email API (no API key needed for basic use)
        # Or use a simple webhook notification
        
        # For now, log the notification (email will be sent when proper service is configured)
        logger.info(f"Email notification would be sent for inquiry: {inquiry.id}")
        logger.info(f"To: {NOTIFICATION_EMAIL}")
        logger.info(f"Subject: New Project Inquiry from {inquiry.name}")
        
        # Try using Gmail SMTP over TLS (port 587) as fallback
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD:
                logger.warning("Gmail credentials not configured")
                return False
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'New Project Inquiry from {inquiry.name} - ROSHKA STUDIO'
            msg['From'] = GMAIL_EMAIL
            msg['To'] = NOTIFICATION_EMAIL
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #050505; color: #F5F5F5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border-radius: 12px; padding: 30px; border: 1px solid #D4AF37;">
                    <h1 style="color: #D4AF37; text-align: center;">ROSHKA STUDIO</h1>
                    <p style="text-align: center; color: #A3A3A3;">New Project Inquiry</p>
                    <hr style="border-color: #D4AF37;">
                    <p><strong style="color: #D4AF37;">Name:</strong> {inquiry.name}</p>
                    <p><strong style="color: #D4AF37;">Email:</strong> {inquiry.email}</p>
                    <p><strong style="color: #D4AF37;">Service:</strong> {inquiry.service_type}</p>
                    <p><strong style="color: #D4AF37;">Description:</strong> {inquiry.project_description}</p>
                    <p><strong style="color: #D4AF37;">Budget:</strong> {inquiry.budget or 'Not specified'}</p>
                    <p><strong style="color: #D4AF37;">Timeline:</strong> {inquiry.timeline or 'Not specified'}</p>
                    <p><strong style="color: #D4AF37;">Date:</strong> {inquiry.timestamp.strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            New Project Inquiry - ROSHKA STUDIO
            
            Name: {inquiry.name}
            Email: {inquiry.email}
            Service: {inquiry.service_type}
            Description: {inquiry.project_description}
            Budget: {inquiry.budget or 'Not specified'}
            Timeline: {inquiry.timeline or 'Not specified'}
            Date: {inquiry.timestamp.isoformat()}
            """
            
            msg.attach(MIMEText(text_content, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))
            
            # Try TLS on port 587 first (more likely to work)
            try:
                with smtplib.SMTP('smtp.gmail.com', 587, timeout=10) as server:
                    server.starttls()
                    server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
                    server.sendmail(GMAIL_EMAIL, NOTIFICATION_EMAIL, msg.as_string())
                logger.info(f"Email sent successfully via TLS for inquiry: {inquiry.id}")
                return True
            except Exception as e1:
                logger.warning(f"TLS failed: {e1}, trying SSL...")
                # Try SSL on port 465 as fallback
                try:
                    with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=10) as server:
                        server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
                        server.sendmail(GMAIL_EMAIL, NOTIFICATION_EMAIL, msg.as_string())
                    logger.info(f"Email sent successfully via SSL for inquiry: {inquiry.id}")
                    return True
                except Exception as e2:
                    logger.error(f"SSL also failed: {e2}")
                    return False
                    
        except Exception as smtp_error:
            logger.error(f"SMTP error: {smtp_error}")
            return False
            
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
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
        background_tasks.add_task(send_email_notification, inquiry)
        
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
        "email_configured": bool(GMAIL_EMAIL and GMAIL_APP_PASSWORD)
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
