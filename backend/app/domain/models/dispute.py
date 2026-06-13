"""Rider-initiated dispute model (P08)."""

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import uuid4

from app.domain.enums import DisputeStatus


@dataclass
class Dispute:
    id: str
    ride_id: str
    rider_id: str
    due_id: str
    reason: str
    status: DisputeStatus
    created_at: datetime


def new_dispute_id() -> str:
    return f"dsp_{uuid4().hex[:12]}"
