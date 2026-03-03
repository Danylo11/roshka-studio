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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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

# Gmail SMTP configuration
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


def get_sheets_service():
    """Create Google Sheets service using service account credentials"""
    try:
        if not GOOGLE_SHEETS_CREDENTIALS:
            logger.warning("Google Sheets credentials not configured")
            return None
            
        creds_dict = json.loads(GOOGLE_SHEETS_CREDENTIALS)
        credentials = service_account.Credentials.from_service_account_info(
            creds_dict,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        service = build('sheets', 'v4', credentials=credentials)
        return service
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
            return False
            
        success, sheet_name = await create_spreadsheet_if_needed(service)
        if not success or not sheet_name:
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


def send_email_notification(inquiry: Inquiry):
    """Send email notification via Gmail SMTP"""
    try:
        if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD:
            logger.warning("Gmail credentials not configured")
            return False
            
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'New Project Inquiry from {inquiry.name} - ROSHKA STUDIO'
        msg['From'] = GMAIL_EMAIL
        msg['To'] = NOTIFICATION_EMAIL
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #050505; color: #F5F5F5; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #0A0A0A; border-radius: 12px; padding: 30px; border: 1px solid rgba(212, 175, 55, 0.3); }}
                .header {{ text-align: center; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; margin-bottom: 30px; }}
                .header h1 {{ color: #D4AF37; margin: 0; font-size: 28px; }}
                .header p {{ color: #A3A3A3; margin: 5px 0 0 0; }}
                .field {{ margin-bottom: 20px; }}
                .label {{ color: #D4AF37; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }}
                .value {{ color: #F5F5F5; font-size: 16px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; }}
                .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #A3A3A3; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>ROSHKA STUDIO</h1>
                    <p>New Project Inquiry</p>
                </div>
                
                <div class="field">
                    <div class="label">Client Name</div>
                    <div class="value">{inquiry.name}</div>
                </div>
                
                <div class="field">
                    <div class="label">Email</div>
                    <div class="value">{inquiry.email}</div>
                </div>
                
                <div class="field">
                    <div class="label">Service Type</div>
                    <div class="value">{inquiry.service_type}</div>
                </div>
                
                <div class="field">
                    <div class="label">Project Description</div>
                    <div class="value">{inquiry.project_description}</div>
                </div>
                
                <div class="field">
                    <div class="label">Budget</div>
                    <div class="value">{inquiry.budget or 'Not specified'}</div>
                </div>
                
                <div class="field">
                    <div class="label">Timeline</div>
                    <div class="value">{inquiry.timeline or 'Not specified'}</div>
                </div>
                
                <div class="field">
                    <div class="label">Submitted At</div>
                    <div class="value">{inquiry.timestamp.strftime('%B %d, %Y at %I:%M %p UTC')}</div>
                </div>
                
                <div class="footer">
                    This email was sent automatically from your ROSHKA STUDIO website.
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        New Project Inquiry - ROSHKA STUDIO
        
        Name: {inquiry.name}
        Email: {inquiry.email}
        Service Type: {inquiry.service_type}
        Project Description: {inquiry.project_description}
        Budget: {inquiry.budget or 'Not specified'}
        Timeline: {inquiry.timeline or 'Not specified'}
        Submitted At: {inquiry.timestamp.isoformat()}
        """
        
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_EMAIL, NOTIFICATION_EMAIL, msg.as_string())
        
        logger.info(f"Email notification sent for inquiry: {inquiry.id}")
        return True
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
async def get_inquiries():
    """Get all inquiries (for admin purposes)"""
    inquiries = await db.inquiries.find({}, {"_id": 0}).to_list(1000)
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
