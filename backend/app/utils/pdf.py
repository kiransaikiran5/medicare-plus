from fpdf import FPDF
from datetime import datetime


# ===================== HELPERS =====================

APP_NAME = "MediCare Plus"
APP_SUBTITLE = "Healthcare Management System"


def _safe_text(value, default="N/A"):
    if value is None or value == "":
        value = default

    value = str(value)

    try:
        value.encode("latin-1")
        return value
    except UnicodeEncodeError:
        return value.encode("latin-1", "replace").decode("latin-1")


def _get_value(obj, field, default="N/A"):
    if obj is None:
        return default

    if isinstance(obj, dict):
        return obj.get(field, default) or default

    return getattr(obj, field, default) or default


def _format_date(value):
    if not value:
        return "N/A"

    if isinstance(value, datetime):
        return value.strftime("%d %b %Y, %I:%M %p")

    return str(value)


def _format_status(value):
    if not value:
        return "N/A"

    if hasattr(value, "value"):
        return str(value.value)

    return str(value)


def _pdf_to_bytes(pdf):
    data = pdf.output(dest="S")

    if isinstance(data, bytearray):
        return bytes(data)

    if isinstance(data, bytes):
        return data

    return data.encode("latin-1")


# ===================== BASE PDF DESIGN =====================

class ProfessionalPDF(FPDF):
    def __init__(self, title="Report", orientation="P"):
        super().__init__(orientation=orientation, unit="mm", format="A4")
        self.report_title = title
        self.set_auto_page_break(auto=True, margin=18)

    def header(self):
        self.set_fill_color(15, 23, 42)
        self.rect(0, 0, self.w, 24, "F")

        self.set_xy(12, 7)
        self.set_font("Arial", "B", 15)
        self.set_text_color(255, 255, 255)
        self.cell(0, 6, APP_NAME, ln=True)

        self.set_x(12)
        self.set_font("Arial", "", 8)
        self.set_text_color(203, 213, 225)
        self.cell(0, 5, APP_SUBTITLE, ln=True)

        self.set_xy(self.w - 80, 8)
        self.set_font("Arial", "B", 10)
        self.set_text_color(255, 255, 255)
        self.cell(68, 6, _safe_text(self.report_title), align="R")

        self.ln(16)

    def footer(self):
        self.set_y(-14)
        self.set_draw_color(226, 232, 240)
        self.line(12, self.get_y(), self.w - 12, self.get_y())

        self.set_y(-11)
        self.set_font("Arial", "", 8)
        self.set_text_color(100, 116, 139)

        self.cell(
            0,
            6,
            f"Generated on {_format_date(datetime.now())} | Page {self.page_no()}",
            align="C",
        )

    def section_title(self, title):
        self.ln(3)
        self.set_font("Arial", "B", 12)
        self.set_text_color(220, 38, 38)
        self.cell(0, 8, _safe_text(title), ln=True)

        self.set_draw_color(254, 202, 202)
        self.line(12, self.get_y(), self.w - 12, self.get_y())
        self.ln(4)

    def key_value(self, label, value, label_width=45):
        self.set_font("Arial", "B", 9)
        self.set_text_color(51, 65, 85)
        self.set_fill_color(248, 250, 252)
        self.cell(label_width, 8, _safe_text(label), border=1, fill=True)

        self.set_font("Arial", "", 9)
        self.set_text_color(15, 23, 42)
        self.cell(0, 8, _safe_text(value), border=1, ln=True)

    def note_box(self, title, value):
        self.set_font("Arial", "B", 10)
        self.set_text_color(51, 65, 85)
        self.cell(0, 7, _safe_text(title), ln=True)

        self.set_font("Arial", "", 9)
        self.set_text_color(15, 23, 42)
        self.set_fill_color(248, 250, 252)
        self.multi_cell(0, 7, _safe_text(value), border=1, fill=True)
        self.ln(3)

    def info_banner(self, text):
        self.set_fill_color(239, 246, 255)
        self.set_text_color(30, 64, 175)
        self.set_font("Arial", "B", 9)
        self.multi_cell(0, 7, _safe_text(text), border=1, fill=True)
        self.set_text_color(0, 0, 0)
        self.ln(4)

    def table_header(self, columns):
        self.set_fill_color(15, 23, 42)
        self.set_text_color(255, 255, 255)
        self.set_font("Arial", "B", 8)

        for label, width in columns:
            self.cell(width, 8, _safe_text(label), border=1, align="C", fill=True)

        self.ln()

    def table_row(self, values, columns, row_height=7):
        self.set_font("Arial", "", 8)
        self.set_text_color(15, 23, 42)

        for value, (_, width) in zip(values, columns):
            text = _safe_text(value)
            max_chars = max(8, int(width * 1.6))
            if len(text) > max_chars:
                text = text[: max_chars - 3] + "..."

            self.cell(width, row_height, text, border=1)

        self.ln()


# ===================== PRESCRIPTION PDF =====================

def generate_prescription_pdf(prescription):
    pdf = ProfessionalPDF("Prescription", orientation="P")
    pdf.add_page()

    pdf.section_title("Prescription Summary")
    pdf.key_value("Prescription ID", _get_value(prescription, "id"))
    pdf.key_value("Date", _format_date(_get_value(prescription, "created_at")))
    pdf.key_value("Patient ID", _get_value(prescription, "patient_id"))
    pdf.key_value("Doctor ID", _get_value(prescription, "doctor_id"))

    pdf.section_title("Medication Details")
    pdf.note_box("Medication", _get_value(prescription, "medication"))
    pdf.note_box("Dosage", _get_value(prescription, "dosage"))
    pdf.note_box("Instructions", _get_value(prescription, "instructions", "None"))

    pdf.info_banner(
        "This is a computer-generated prescription. Please follow your doctor's instructions and consult the doctor for any clarification."
    )

    return _pdf_to_bytes(pdf)


# ===================== APPOINTMENTS PDF =====================

def generate_appointments_pdf(appointments):
    pdf = ProfessionalPDF("Appointments Report", orientation="L")
    pdf.add_page()

    pdf.section_title("Appointments Overview")

    columns = [
        ("ID", 12),
        ("Patient", 25),
        ("Doctor", 25),
        ("Appointment Time", 48),
        ("Status", 30),
        ("Reason", 125),
    ]

    pdf.table_header(columns)

    if not appointments:
        pdf.table_row(["No records found", "", "", "", "", ""], columns)
    else:
        for appt in appointments:
            pdf.table_row(
                [
                    _get_value(appt, "id"),
                    _get_value(appt, "patient_id"),
                    _get_value(appt, "doctor_id"),
                    _format_date(_get_value(appt, "appointment_time")),
                    _format_status(_get_value(appt, "status")),
                    _get_value(appt, "reason", ""),
                ],
                columns,
            )

    pdf.ln(5)
    pdf.info_banner("Appointments report generated from MediCare Plus system records.")

    return _pdf_to_bytes(pdf)


# ===================== MEDICAL RECORDS PDF =====================

def generate_medical_records_pdf(records):
    pdf = ProfessionalPDF("Medical Records Report", orientation="L")
    pdf.add_page()

    pdf.section_title("Medical Records Overview")

    columns = [
        ("ID", 12),
        ("Patient", 25),
        ("Record Type", 45),
        ("Description", 140),
        ("Created", 40),
    ]

    pdf.table_header(columns)

    if not records:
        pdf.table_row(["No records found", "", "", "", ""], columns)
    else:
        for rec in records:
            pdf.table_row(
                [
                    _get_value(rec, "id"),
                    _get_value(rec, "patient_id"),
                    _get_value(rec, "record_type"),
                    _get_value(rec, "description"),
                    _format_date(_get_value(rec, "created_at")),
                ],
                columns,
            )

    pdf.ln(5)
    pdf.info_banner("Medical records report generated from verified patient records.")

    return _pdf_to_bytes(pdf)


# ===================== BILLING PDF =====================

def generate_billing_pdf(bills):
    pdf = ProfessionalPDF("Billing Report", orientation="L")
    pdf.add_page()

    pdf.section_title("Billing Overview")

    columns = [
        ("ID", 12),
        ("Patient", 25),
        ("Amount", 35),
        ("Status", 35),
        ("Payment Method", 50),
        ("Date", 45),
    ]

    pdf.table_header(columns)

    if not bills:
        pdf.table_row(["No bills found", "", "", "", "", ""], columns)
    else:
        for bill in bills:
            amount = _get_value(bill, "amount", 0)

            try:
                amount_text = f"Rs. {float(amount):.2f}"
            except Exception:
                amount_text = str(amount)

            pdf.table_row(
                [
                    _get_value(bill, "id"),
                    _get_value(bill, "patient_id"),
                    amount_text,
                    _format_status(_get_value(bill, "status")),
                    _get_value(bill, "payment_method", "N/A"),
                    _format_date(_get_value(bill, "created_at")),
                ],
                columns,
            )

    pdf.ln(5)
    pdf.info_banner("Billing report generated from MediCare Plus payment records.")

    return _pdf_to_bytes(pdf)


# ===================== LAB TEST PDF =====================

def generate_lab_test_pdf(lab_test, patient=None, doctor=None):
    pdf = ProfessionalPDF("Lab Test Report", orientation="P")
    pdf.add_page()

    pdf.section_title("Lab Test Summary")
    pdf.key_value("Lab Test ID", _get_value(lab_test, "id"))
    pdf.key_value("Test Name", _get_value(lab_test, "test_name"))
    pdf.key_value("Status", _format_status(_get_value(lab_test, "status")))
    pdf.key_value("Created At", _format_date(_get_value(lab_test, "created_at")))

    pdf.section_title("Patient Details")
    pdf.key_value(
        "Patient Name",
        _get_value(patient, "name", _get_value(lab_test, "patient_name")),
    )
    pdf.key_value("Patient ID", _get_value(lab_test, "patient_id"))

    pdf.section_title("Doctor Details")
    pdf.key_value(
        "Doctor Name",
        _get_value(doctor, "name", _get_value(lab_test, "doctor_name")),
    )
    pdf.key_value("Doctor ID", _get_value(lab_test, "doctor_id"))

    pdf.section_title("Result Details")
    pdf.key_value("Test Date", _format_date(_get_value(lab_test, "test_date")))
    pdf.key_value("Result Value", _get_value(lab_test, "result_value"))
    pdf.key_value("Normal Range", _get_value(lab_test, "normal_range"))

    pdf.note_box("Result", _get_value(lab_test, "result", "Pending"))
    pdf.note_box("Notes", _get_value(lab_test, "notes", "No additional notes"))

    pdf.info_banner(
        "This is a computer-generated lab test report. Please consult your doctor for medical interpretation."
    )

    return _pdf_to_bytes(pdf)