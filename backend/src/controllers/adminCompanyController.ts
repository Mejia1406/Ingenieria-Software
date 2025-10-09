import { Request, Response } from 'express'; // se hace import de Request y Response de express(asi es como funciona express)
import Company from '../models/Company'; // se importa el modelo de Company
import Review from '../models/Review'; // se importa lo de Review
import { AuthRequest } from '../middleware/auth'; // se importa el middleware de auth
import mongoose from 'mongoose'; // se importa mongoose para validar los ids

// esta funciona de adminListCompanies es para que el admin pueda ver todas las empresas, con paginacion, busqueda y filtros
// se pasa el req y res como parametros porque es una ruta de express y asi es como funcionan las rutas en express
export const adminListCompanies = async (req: Request, res: Response) => { 
  // a ver, en express existe los query params, que son parametros que se pasan en la URL despues del signo ?
  // cuando hay una solicitud GET, se consigue la url y se consigue los query params
  try { 
    const page = parseInt(req.query.page as string) || 1; // aca se obtiene el parametro de paginas y si no esta se pone 1
    const limit = parseInt(req.query.limit as string) || 20; // aca se obtiene el parametro de limite y si no esta se pone 20
    const search = (req.query.search as string) || ''; // aca se obtiene el parametro de busqueda y si no esta se pone vacio
    const industry = req.query.industry as string; // aca se obtiene el parametro de industria
    const verified = req.query.verified as string; // aca se obtiene el parametro de verificado (true o false)

    const query: any = {}; // aca se crea un objeto vacio que va a ser la consulta a la base de datos
    if (search) { // entt si hay un parametro de busqueda como por ejemplo ?search=tech
      query.$or = [ // se crea una consulta $or que busca en el nombre y descripcion de la empresa($or es un operador de mongo que significa "o")
        { name: new RegExp(search, 'i') }, // esto busca el nombre de la empresa que contenga el texto ese de busqueda y el i es para que no importe mayusculas o minusculas
        { description: new RegExp(search, 'i') }
      ];
    }
    if (industry) query.industry = industry; // entt si hay una industria se va a añadir a la consulta
    if (verified === 'true') query.isVerified = true; // entt si el parametro de verificado es true se añade a la consulta
    if (verified === 'false') query.isVerified = false; // y si es false tambien se añade a la consulta porque puede que el admin quiera ver las no verificadas

    const total = await Company.countDocuments(query); // aca se cuenta la cantidad total de empresas que cumplen con la consulta
    const companies = await Company.find(query) // aca se buscan las empresas que cumplen con la consulta, ejm: si la consulta es { industry: 'tech' } entonces busca todas las empresas en la base de datos que tengan tech
      .sort({ createdAt: -1 }) // y aca se ordena por la fecha decreacion de mas nuevas a mas viejas
      .skip((page - 1) * limit) // eso es para que se muestren las empresas por pagina, o sea que no se muestren todas de una vez
      .limit(limit) // y esto es para limitar la cantidad de empresas que se muestran por pagina
      .lean(); // y el lean es con el fin de que no traiga toda la informacion de mongoose, sino solo la informacion basica

    const companyIds = companies.map(c => c._id); // aca se obtiene un array con los ids de las empresas que se encontraron
    let reviewStats: Record<string, { average: number; count: number }> = {}; // aca se crea un objeto vacio que va a tener las estadisticas de las reviews de cada empresa
    if (companyIds.length) { // entt si hay empresas encontradas
      const agg = await Review.aggregate([ // se hace una agregacion en la coleccion de reviews para obtener el promedio y la cantidad de reviews por empresa
        { $match: { company: { $in: companyIds }, moderationStatus: 'approved', isVisible: true, overallRating: { $gte: 1 } } }, // se filtra por las reviews que pertenecen a las empresas encontradas, que esten aprobadas, que sean visibles y que tengan una calificacion mayor o igual a 1
        { $group: { _id: '$company', average: { $avg: '$overallRating' }, count: { $sum: 1 } } } // y se agrupan por empresa para obtener el promedio y la cantidad de reviews
      ]);
      reviewStats = agg.reduce((acc: any, r: any) => {
        acc[r._id.toString()] = { average: r.average, count: r.count }; return acc;
      }, {});
    }

    // este bloque tiene el fin de mostrar el promedio y la cantidad de reviews junto con la informacion de la empresa
    const enriched = companies.map(c => { 
      const stats = reviewStats[c._id.toString()] || { average: 0, count: 0 };
      return { ...c, overallRating: Number(stats.average?.toFixed?.(1) || 0), totalReviews: stats.count };
    });

    // y ya el backend responde con un json con los datos de las empresas, las estadisticas de reviews y la paginacion al frontend
    res.json({
      success: true,
      data: { companies: enriched, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error listing companies', error: err.message });
  }
};

// esta funcion de adminGetCompany es para que el admin pueda ver la informacion de una empresa en particular
export const adminGetCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // aca se obtiene el id de la empresa de los parametros de la ruta ejm
    if (!mongoose.isValidObjectId(id)) { 
      return res.status(400).json({ success: false, message: 'Invalid company id' }); // aca se valida que el id sea un id valido de mongo si no lo es responde con un error 400 
    }
    const company = await Company.findById(id).lean(); // aca se busca la empresa por su id
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    const stat = await Review.aggregate([ // aca se hace una agregacion en la coleccion de reviews para obtener el promedio y la cantidad de reviews de esa empresa
      { $match: { company: company._id, moderationStatus: 'approved', isVisible: true, overallRating: { $gte: 1 } } },
      { $group: { _id: '$company', average: { $avg: '$overallRating' }, count: { $sum: 1 } } }
    ]);
    const average = stat[0]?.average || 0;
    const count = stat[0]?.count || 0;
    res.json({ success: true, data: { company: { ...company, overallRating: Number(average.toFixed(1)), totalReviews: count } } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching company', error: err.message });
  }
};

// aca el admin puede crear una empresa nueva (por ahora no se usa en el frontend, pero la deje porque ps falta hacerlo)
export const adminCreateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const existing = await Company.findOne({ name: new RegExp(`^${data.name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company name already exists' });
    }
    const generatedSlug = data.name?.toLowerCase()?.trim() // se genera el slug a partir del nombre de la empresa(slug es como un identificador unico en la UR)
      .replace(/[^a-z0-9\s-]/g, '') // elimina caracteres especiales que no sean letras, numeros, espacios o guiones
      .replace(/\s+/g, '-') // se cambian los espacios por guiones
      .replace(/-+/g, '-'); // se eliminan los guiones duplicados
    if (generatedSlug) { // si se genero un slug entonces se verifica que no exista otra empresa con ese slug
      const slugExists = await Company.findOne({ slug: generatedSlug });
      if (slugExists) {
        return res.status(400).json({ success: false, message: 'Another company already uses resulting slug (choose a more unique name)' });
      }
    }
    const company = new Company({ // se crea la nueva empresa
      ...data, // se copian los datos que vienen en el body de la solicitud en data y se pasan al modelo de Company
      verifiedBy: req.user?._id, // se pone el id del admin que esta creando la empresa
      isVerified: true // y se pone que la empresa esta verificada porque la esta creando un admin 
    });
    await company.save(); // y aca se guarda en la base de datos
  res.status(201).json({ success: true, data: { company: { ...company.toObject(), overallRating: 0, totalReviews: 0 } } }); // y se responde con un json con la informacion de la empresa creada
  } catch (err: any) { // si hay algun tipo de error entonces se le da el manejo en todo ese codigo, ejm: si se intenta crear una empresa con un nombre que ya existe
    if (err?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key (name or slug) already exists' });
    }
    if (err?.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e:any)=>({ field: e.path, message: e.message }));
      return res.status(400).json({ success:false, message:'Model validation failed', errors: details });
    }
    res.status(500).json({ success: false, message: 'Error creating company', error: err.message, errorDetail: err.stack });
  }
};

// aca el admin puede actualizar la informacion de una empresa existente
export const adminUpdateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.name) {
      const existing = await Company.findOne({ _id: { $ne: id }, name: new RegExp(`^${updates.name}$`, 'i') });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Another company already uses this name' });
      }
      const futureSlug = updates.name.toLowerCase().trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      const slugConflict = await Company.findOne({ _id: { $ne: id }, slug: futureSlug });
      if (slugConflict) {
        return res.status(400).json({ success: false, message: 'Another company already uses resulting slug (pick a different name)' });
      }
    }
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    Object.assign(company, updates);
    await company.save();
    const stat = await Review.aggregate([
      { $match: { company: company._id, moderationStatus: 'approved', isVisible: true, overallRating: { $gte: 1 } } },
      { $group: { _id: '$company', average: { $avg: '$overallRating' }, count: { $sum: 1 } } }
    ]);
    const average = stat[0]?.average || 0;
    const count = stat[0]?.count || 0;
    res.json({ success: true, data: { company: { ...company.toObject(), overallRating: Number(average.toFixed(1)), totalReviews: count } } });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Duplicate key (name or slug) already exists' });
    }
    if (err?.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map((e:any)=>({ field: e.path, message: e.message }));
      return res.status(400).json({ success:false, message:'Model validation failed', errors: details });
    }
    res.status(500).json({ success: false, message: 'Error updating company', error: err.message, errorDetail: err.stack });
  }
};

export const adminDeleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndDelete(id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, message: 'Company deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error deleting company', error: err.message });
  }
};
