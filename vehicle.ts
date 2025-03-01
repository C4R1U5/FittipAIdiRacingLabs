type Vehicle = {
    id: string;
    make: string;
    model: string;
    year: number;
    type: 'car' | 'motorcycle' | 'other';
    specs: {
        engine: {
            type: string;
            displacement: number; // in cc
            horsepower: number;
            torque: number; // in Nm
        };
        transmission: {
            type: 'manual' | 'automatic' | 'sequential';
            gears: number;
        };
        weight: number; // in kg
        dimensions: {
            length: number; // in mm
            width: number; // in mm
            height: number; // in mm
            wheelbase: number; // in mm
        };
    };
    performance: {
        topSpeed: number; // in km/h
        acceleration: number; // 0-100 km/h in seconds
        brakingDistance: number; // 100-0 km/h in meters
    };
    status: {
        condition: 'excellent' | 'good' | 'fair' | 'poor';
        mileage: number; // in km
        lastService: Date;
    };
};

export default Vehicle; 