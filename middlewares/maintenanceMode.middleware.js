export default function maintenanceMode(req, res, next) {
    if (process.env.MAINTENANCE_MODE === "true") {
        return res.status(503).json({
            message: "La plataforma está en mantenimiento. Inténtelo más tarde.",
            maintenance: true
        });
    }
    next();
}

  