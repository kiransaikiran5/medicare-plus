from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.models.doctor_schedule import DoctorSchedule
from app.models.appointment import Appointment, AppointmentStatus


IST = timezone(timedelta(hours=5, minutes=30))


def _to_utc_naive(dt: datetime) -> datetime:
    """
    Database appointment_time is stored as naive UTC.

    If datetime is naive, treat it as UTC.
    If datetime is timezone-aware, convert it to UTC and remove timezone.
    """
    if dt.tzinfo is None:
        return dt.replace(second=0, microsecond=0)

    return dt.astimezone(timezone.utc).replace(
        tzinfo=None,
        second=0,
        microsecond=0,
    )


def _utc_naive_to_ist_naive(dt: datetime) -> datetime:
    """
    Convert database UTC naive datetime to IST naive datetime.

    Example:
    UTC DB: 2026-06-11 03:30
    IST:    2026-06-11 09:00
    """
    utc_dt = _to_utc_naive(dt).replace(tzinfo=timezone.utc)

    return utc_dt.astimezone(IST).replace(
        tzinfo=None,
        second=0,
        microsecond=0,
    )


def _normalize_day(day_value) -> str:
    """
    Supports:
    MONDAY
    Monday
    DayOfWeek.MONDAY
    """
    if hasattr(day_value, "value"):
        day_value = day_value.value

    return str(day_value).replace("DayOfWeek.", "").strip().upper()


def is_slot_available(
    doctor_id: int,
    appointment_time: datetime,
    db: Session,
) -> bool:
    """
    appointment_time must be UTC naive.

    Example:
    User selected 09:00 AM IST
    appointment_time here should be 03:30 UTC naive

    This function:
    1. Converts UTC appointment time to IST.
    2. Checks if IST time exists in doctor's schedule.
    3. Checks if UTC time is already booked in appointments table.
    """

    appointment_time_utc = _to_utc_naive(appointment_time)
    appointment_time_ist = _utc_naive_to_ist_naive(appointment_time_utc)

    appointment_day = appointment_time_ist.strftime("%A").upper()
    appointment_date = appointment_time_ist.date()

    schedules = (
        db.query(DoctorSchedule)
        .filter(DoctorSchedule.doctor_id == doctor_id)
        .all()
    )

    if not schedules:
        return False

    for schedule in schedules:
        schedule_day = _normalize_day(schedule.day_of_week)

        if schedule_day != appointment_day:
            continue

        start_dt = datetime.combine(appointment_date, schedule.start_time).replace(
            second=0,
            microsecond=0,
        )

        end_dt = datetime.combine(appointment_date, schedule.end_time).replace(
            second=0,
            microsecond=0,
        )

        slot_duration = timedelta(minutes=schedule.slot_duration_minutes or 30)

        current_slot = start_dt

        while current_slot < end_dt:
            if current_slot == appointment_time_ist:
                conflicting = (
                    db.query(Appointment)
                    .filter(
                        Appointment.doctor_id == doctor_id,
                        Appointment.appointment_time == appointment_time_utc,
                        Appointment.status != AppointmentStatus.CANCELLED,
                    )
                    .first()
                )

                return conflicting is None

            current_slot += slot_duration

    return False