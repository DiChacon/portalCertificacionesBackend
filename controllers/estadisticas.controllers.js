import { CertificadoQueries } from "../queries/certificado.query.js";
import { UserQueries } from "../queries/user.query.js";
import { institucionQueries } from "../queries/institucion.query.js";
import { resultadoQueries } from "../queries/resultado.query.js";

class estadisticasController{
  async getGeneralStatistics(req, res){
    try{
      const totalCertifications = await CertificadoQueries.countAll();
      const totalUsers = await UserQueries.countAll();
      const totalInstitutions = await institucionQueries.countAll();
      const totalAverage = await resultadoQueries.statisticsResultsAverage();
      const allInstitutions = await institucionQueries.getAllInstitutions();

      if(!totalCertifications || !totalUsers || !totalInstitutions || !totalAverage)
        return res.status(400).json({ ok: false, message: 'No se pudieron cargar las estadísticas' });

      return res.status(200).json(
        { ok: true, 
          data: {
            totalCertifications: totalCertifications.data,
            totalUsers: totalUsers.data,
            totalInstitutions: totalInstitutions.data,
            totalAverage: totalAverage.data,
            allInstitutions: allInstitutions.data
          }
        });

    }catch(error){
      console.error(error);
      return res.status(403).json({ ok: false, data: null, message: error });
    }
  }
}

export const EstadisticasController = new estadisticasController();