import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Header
        self.drawString(54, 750, "CIVICSHIELD / CIVICAI — SYSTEM ARCHITECTURE & PROTOTYPE SPECIFICATION")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Footer
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "CONFIDENTIAL • SMART INDIA HACKATHON 2026 PS 26124")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()

def create_report(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=60
    )
    
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A"),
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#D97706"),
        spaceAfter=14
    )
    
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13.5,
        textColor=colors.HexColor("#1E293B"),
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=12,
        spaceAfter=3
    )
    
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []
    
    # Title Header
    story.append(Paragraph("CivicShield — Prototype Documentation & Tech Spec", title_style))
    story.append(Paragraph("AI-Enabled Verified Official Identity & Mobile Urban Sensing Platform • SIH 2026 PS 26124", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#F59E0B"), spaceAfter=10))
    
    # Summary Banner Box
    meta_data = [
        [Paragraph("<b>Target Event:</b> Smart India Hackathon 2026", table_cell), Paragraph("<b>Problem Statement:</b> PS 26124", table_cell)],
        [Paragraph("<b>Backend API:</b> Python FastAPI (Port 8000)", table_cell), Paragraph("<b>Frontend App:</b> Next.js 14 App Router (Port 3000)", table_cell)],
        [Paragraph("<b>Local Execution:</b> http://localhost:3000", table_cell), Paragraph("<b>Sensing Dashboard:</b> http://localhost:3000/sih-sensing", table_cell)]
    ]
    t_meta = Table(meta_data, colWidths=[250, 254])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF3C7")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#FDE68A")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    # Section 1: Executive Summary & System Capabilities
    story.append(Paragraph("1. System Capabilities & Overview", h1_style))
    story.append(Paragraph("CivicShield is an enterprise-grade Smart Governance and Mobile Urban Intelligence platform created for <b>SIH 2026 Problem Statement PS 26124</b>. It converts public transport buses into continuous mobile sensing units detecting potholes, damaged signs, pedestrian dangers, and vehicle incidents while offering citizen QR official verification.", body_style))

    story.append(Paragraph("• <b>Mobile Fleet AI Sensing (/sih-sensing):</b> Features a 4-camera onboard video canvas switcher (Front, Rear, Side, Cabin), TensorRT YOLOv8 road defect overlays (Pothole 94.8%), ANPR license plate extraction, pedestrian danger alerts, and central Leaflet GIS hazard auto-pinning with automated GCC municipal repair tickets.", bullet_style))
    story.append(Paragraph("• <b>Official Identity Verification (/verify):</b> Browser QR scanner (<code>html5-qrcode</code>) verifying official badges against SQLite records, rendering ACTIVE/SUSPENDED status badges and anti-extortion warnings.", bullet_style))
    story.append(Paragraph("• <b>Rating Anti-Abuse Engine (/ratings):</b> Scikit-learn <b>IsolationForest ML model</b> (<code>rating_anomaly.py</code>) filtering multi-metric citizen feedback to detect rating manipulation bursts.", bullet_style))
    story.append(Paragraph("• <b>Multimodal Travel Planner (/mobility, /trip-manager):</b> Weighted utility route solver and <b>Google Gemini 1.5 Flash API</b> conversational trip manager.", bullet_style))
    story.append(Paragraph("• <b>Government Office Locator (/offices):</b> Python <b>Haversine distance calculator</b> sorting nearby Police, Hospital, EB, and Municipal offices.", bullet_style))

    # Section 2: Demo Role Accounts Table
    story.append(Paragraph("2. Demo Role Accounts & Access Portals", h1_style))
    roles_table_data = [
        [Paragraph("<b>Role</b>", table_header), Paragraph("<b>Demo Email</b>", table_header), Paragraph("<b>Password</b>", table_header), Paragraph("<b>Access Portals</b>", table_header)],
        [Paragraph("Citizen", table_cell), Paragraph("citizen@demo.com", table_cell), Paragraph("Demo@123", table_cell), Paragraph("/verify, /sih-sensing, /mobility, /offices", table_cell)],
        [Paragraph("Official", table_cell), Paragraph("officer@demo.com", table_cell), Paragraph("Demo@123", table_cell), Paragraph("/official/dashboard, /official/qr", table_cell)],
        [Paragraph("Transport Authority", table_cell), Paragraph("authority@demo.com", table_cell), Paragraph("Demo@123", table_cell), Paragraph("/authority/scheduling", table_cell)],
        [Paragraph("Admin", table_cell), Paragraph("admin@demo.com", table_cell), Paragraph("Demo@123", table_cell), Paragraph("/admin, /admin/analytics", table_cell)]
    ]
    t_roles = Table(roles_table_data, colWidths=[100, 120, 84, 200])
    t_roles.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E293B")),
        ('BORDER', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
    ]))
    story.append(t_roles)
    story.append(Spacer(1, 8))

    # Section 3: AI / ML Matrix Table
    story.append(Paragraph("3. AI / ML Implementation Matrix", h1_style))
    ml_table_data = [
        [Paragraph("<b>Subsystem</b>", table_header), Paragraph("<b>Algorithm / Model</b>", table_header), Paragraph("<b>Input ➔ Output Format</b>", table_header), Paragraph("<b>Implementation Status</b>", table_header)],
        [Paragraph("Rating Anti-Abuse", table_cell), Paragraph("IsolationForest", table_cell), Paragraph("8 Metrics ➔ Anomaly Score (-1 / 1)", table_cell), Paragraph("<b>IMPLEMENTED</b>", table_cell)],
        [Paragraph("Passenger Demand", table_cell), Paragraph("RandomForestRegressor", table_cell), Paragraph("Route, Hour, Weather ➔ Count", table_cell), Paragraph("<b>IMPLEMENTED</b>", table_cell)],
        [Paragraph("O-D Transfer Pattern", table_cell), Paragraph("DBSCAN Graph Clustering", table_cell), Paragraph("Origin/Dest Coordinates ➔ Cluster", table_cell), Paragraph("<b>IMPLEMENTED</b>", table_cell)],
        [Paragraph("Office Queue Time", table_cell), Paragraph("Linear Regression", table_cell), Paragraph("Visitors, Hour ➔ Wait Mins", table_cell), Paragraph("<b>IMPLEMENTED</b>", table_cell)],
        [Paragraph("Conversational AI", table_cell), Paragraph("Google Gemini 1.5 Flash", table_cell), Paragraph("Text Query ➔ Trip Plan", table_cell), Paragraph("<b>IMPLEMENTED</b>", table_cell)],
        [Paragraph("Mobile Fleet AI Sensing", table_cell), Paragraph("YOLOv8s + TensorRT (Sim)", table_cell), Paragraph("Video Frame ➔ BBox, Conf, GPS", table_cell), Paragraph("<b>PROTOTYPE / DEMO</b>", table_cell)]
    ]
    t_ml = Table(ml_table_data, colWidths=[105, 125, 184, 90])
    t_ml.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('BORDER', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
    ]))
    story.append(t_ml)
    story.append(Spacer(1, 8))

    # Section 4: SIH 11-Step Walkthrough (BUS 104A)
    story.append(Paragraph("4. SIH Evaluator 11-Step Demonstration Story (BUS 104A)", h1_style))
    steps = [
        "<b>Step 1:</b> Select BUS 104A (TN-01-N-9842) running on Route 70H.",
        "<b>Step 2:</b> Open Onboard 4-Camera Feeds (Front Road, Rear Traffic, Side Obstacle, Cabin Safety).",
        "<b>Step 3 & 4:</b> Computer vision detects severe asphalt pothole on Front camera (Class <code>POTHOLE_SEVERE</code>, 94.8% confidence).",
        "<b>Step 5:</b> Edge AI attaches GPS coordinates (<code>13.0067°N, 80.2020°E</code>) and microsecond ISO timestamp.",
        "<b>Step 6 & 7:</b> Hazard marker auto-pins onto central Leaflet GIS map and streams live to Command Dashboard.",
        "<b>Step 8:</b> Traffic Analytics displays vehicle counting (1,420 Bikes, 580 Autos, 1,120 Cars) and Kathipara delay (+14 mins).",
        "<b>Step 9:</b> Pedestrian Safety flags school children entering dangerous non-zebra zone near Koyambedu Metro.",
        "<b>Step 10:</b> ANPR Incident extracts license plate <code>TN-09-AB-1234</code> driving at 74 km/h in 40 km/h zone.",
        "<b>Step 11:</b> Automated Municipal Work Order <code>#GCC-ROAD-4092</code> dispatched to Greater Chennai Corporation."
    ]
    for s in steps:
        story.append(Paragraph(f"• {s}", bullet_style))

    # Section 5: Tech Stack & Architecture
    story.append(Paragraph("5. Complete Technical Stack Summary", h1_style))
    story.append(Paragraph("• <b>Frontend:</b> Next.js 14.2.35 (App Router), React 18.3, TypeScript 5.6, Tailwind CSS 3.4, Leaflet 1.9.4 GIS, HTML5-QRCode.", body_style))
    story.append(Paragraph("• <b>Backend:</b> Python 3.11/3.14, FastAPI 0.110, Uvicorn ASGI Server, SQLAlchemy 2.0 ORM, FastAPI WebSockets.", body_style))
    story.append(Paragraph("• <b>AI / ML:</b> Scikit-Learn (IsolationForest, RandomForest, DBSCAN), Google Gemini 1.5 Flash SDK, NVIDIA Jetson Edge AI Simulator.", body_style))
    story.append(Paragraph("• <b>Database:</b> Relational SQLite Database file (<code>civicai.db</code>) with 8 entities.", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF created: {output_filename}")

if __name__ == "__main__":
    output_path = "/Users/purushothambalamurali/Desktop/civicAI/CivicShield_Prototype_Documentation.pdf"
    create_report(output_path)
