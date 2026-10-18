
const calculateDistance = (
    lat1,
    lng1,
    lat2,
    lng2
) => {
    const R = 6371000; 

    const toRadians = (value) => {
        return (value * Math.PI) / 180;
    };

    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
};


const getGeofenceStatus = (
    employeeLat,
    employeeLng,
    locationLat,
    locationLng,
    radius
) => {
    const distance = calculateDistance(
        employeeLat,
        employeeLng,
        locationLat,
        locationLng
    );

    return {
        distance,
        status: distance <= radius
            ? "inside"
            : "outside"
    };
};


module.exports = {
    calculateDistance,
    getGeofenceStatus
};

