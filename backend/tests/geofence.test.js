const {
    calculateDistance,
    getGeofenceStatus
} = require("../geofence");

describe("Geofence Logic", () => {

    test("should return 0 distance for the same location", () => {
        const distance = calculateDistance(
            12.9716,
            77.5946,
            12.9716,
            77.5946
        );

        expect(distance).toBe(0);
    });

    test("should calculate distance between two locations", () => {
        const distance = calculateDistance(
            12.9716,
            77.5946,
            12.9726,
            77.5946
        );

        // Approximately 111 meters
        expect(distance).toBeGreaterThan(100);
        expect(distance).toBeLessThan(120);
    });

    test("should return inside when employee is within geofence radius", () => {
        const result = getGeofenceStatus(
            12.9716,
            77.5946,
            12.9720,
            77.5946,
            100
        );

        expect(result.status).toBe("inside");
        expect(result.distance).toBeLessThanOrEqual(100);
    });

    test("should return outside when employee is beyond geofence radius", () => {
        const result = getGeofenceStatus(
            12.9716,
            77.5946,
            12.9720,
            77.5946,
            20
        );

        expect(result.status).toBe("outside");
        expect(result.distance).toBeGreaterThan(20);
    });

});