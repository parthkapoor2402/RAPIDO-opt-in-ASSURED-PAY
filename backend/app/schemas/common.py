from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(..., examples=["ok"])
    service: str


class VersionResponse(BaseModel):
    name: str
    version: str
    environment: str
    settlement_policy_version: str


class PlaceholderResponse(BaseModel):
    status: str = Field(default="placeholder")
    module: str
    message: str = Field(
        default="Endpoint stub — business logic not implemented yet.",
    )
