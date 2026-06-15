import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VehicleMapMarkers } from "@/features/booking/components/VehicleMapMarkers";

describe("VehicleMapMarkers", () => {
  it("renders nothing when not visible", () => {
    render(<VehicleMapMarkers visible={false} selectedCategory="bike" />);
    expect(screen.queryByTestId("vehicle-map-markers")).not.toBeInTheDocument();
  });

  it("renders multiple markers per category around pickup", () => {
    render(<VehicleMapMarkers visible selectedCategory="bike" />);

    expect(screen.getByTestId("vehicle-marker-bike-1")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-marker-bike-5")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-marker-auto-1")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-marker-auto-3")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-marker-cab-1")).toBeInTheDocument();
    expect(screen.getByTestId("vehicle-marker-cab-2")).toBeInTheDocument();
  });

  it("highlights bike markers when bike is selected", () => {
    render(<VehicleMapMarkers visible selectedCategory="bike" />);

    expect(screen.getByTestId("vehicle-marker-bike-1")).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByTestId("vehicle-marker-auto-1")).toHaveAttribute("data-highlighted", "false");
    expect(screen.getByTestId("nearby-supply-primary")).toHaveTextContent("5 bikes nearby");
    expect(screen.getByTestId("nearby-supply-bike")).toHaveTextContent("5");
  });

  it("highlights auto markers when auto is selected", () => {
    render(<VehicleMapMarkers visible selectedCategory="auto" />);

    expect(screen.getByTestId("vehicle-map-markers")).toHaveAttribute("data-selected-category", "auto");
    expect(screen.getByTestId("vehicle-marker-auto-2")).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByTestId("nearby-supply-primary")).toHaveTextContent("3 autos nearby");
  });

  it("highlights cab markers when cab is selected", () => {
    render(<VehicleMapMarkers visible selectedCategory="cab" />);

    expect(screen.getByTestId("vehicle-marker-cab-1")).toHaveAttribute("data-highlighted", "true");
    expect(screen.getByTestId("nearby-supply-primary")).toHaveTextContent("2 cabs nearby");
    expect(screen.getByTestId("nearby-supply-density")).toHaveTextContent("2");
  });
});
