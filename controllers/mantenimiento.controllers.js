export class mantenimientoController {
    mantenimiento(req, res){
        return res.status(200).json({
            message: "La página está funcionando correctamente",
            maintenance: false
        });
    }
}

export const MantenimientoController = new mantenimientoController();