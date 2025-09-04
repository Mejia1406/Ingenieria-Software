import { Router } from "express";
import { body, query, param } from "express-validator";
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  getCompanyReviews,
  searchCompanies
} from "../controllers/companyController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import Company from "../models/Company";

const router = Router();

/**
 * GET /api/companies
 * Lista de empresas con filtros y paginación
 */
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("search").optional().isString().trim(),
    query("industry").optional().isString().trim(),
    query("size").optional().isIn(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]),
    query("location").optional().isString().trim(),
    query("sortBy").optional().isIn(["name", "overallRating", "totalReviews", "createdAt"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  validateRequest,
  getCompanies
);

/**
 * POST /api/companies/search
 * Búsqueda avanzada con filtros
 */
router.post(
  "/search",
  [
    body("q").optional().isString().trim(),
    body("filters.industries").optional().isArray(),
    body("filters.sizes").optional().isArray(),
    body("filters.countries").optional().isArray(),
    body("filters.minRating").optional().isFloat({ min: 0, max: 5 }),
    body("filters.verified").optional().isBoolean(),
  ],
  validateRequest,
  searchCompanies
);

/**
 * GET /api/companies/:slug
 * Obtener empresa por slug
 */
router.get(
  "/:slug",
  [param("slug").isString().matches(/^[a-z0-9-]+$/).withMessage("Invalid company slug format")],
  validateRequest,
  optionalAuth,
  getCompany
);

/**
 * GET /api/companies/:slug/reviews
 * Obtener reviews de una empresa
 */
router.get(
  "/:slug/reviews",
  [
    param("slug").isString().matches(/^[a-z0-9-]+$/).withMessage("Invalid company slug format"),
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("reviewType").optional().isIn(["interview", "employee", "intern", "contractor"]),
    query("rating").optional().isInt({ min: 1, max: 5 }),
    query("sortBy").optional().isIn(["createdAt", "overallRating", "helpfulVotes"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
  ],
  validateRequest,
  getCompanyReviews
);

// Obtener todas las empresas
/**
 * POST /api/companies
 * Crear empresa (solo reclutadores o admin)
 */
router.post(
  "/",
  authenticate,
  authorize("recruiter", "admin"),
  [
    body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Company name must be between 2 and 100 characters"),
    body("description").optional().isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),
    body("website").optional().isURL().withMessage("Please provide a valid website URL"),
    body("industry").trim().notEmpty().withMessage("Industry is required"),
    body("size").isIn(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).withMessage("Invalid company size"),
    body("foundedYear")
      .optional()
      .isInt({ min: 1800, max: new Date().getFullYear() })
      .withMessage("Please provide a valid founding year"),
    body("headquarters.city").trim().notEmpty().withMessage("Headquarters city is required"),
    body("headquarters.country").trim().notEmpty().withMessage("Headquarters country is required"),
    body("contactInfo.email").optional().isEmail().withMessage("Please provide a valid contact email"),
    body("keywords").optional().isArray().withMessage("Keywords must be an array"),
  ],
  validateRequest,
  createCompany
);

/**
 * PUT /api/companies/:id
 * Actualizar empresa (solo reclutadores dueños o admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize("recruiter", "admin"),
  [
    param("id").isMongoId().withMessage("Invalid company ID"),
    body("name").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Company name must be between 2 and 100 characters"),
    body("description").optional().isLength({ max: 2000 }).withMessage("Description cannot exceed 2000 characters"),
    body("website").optional().isURL().withMessage("Please provide a valid website URL"),
    body("industry").optional().trim().notEmpty().withMessage("Industry cannot be empty"),
    body("size").optional().isIn(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]).withMessage("Invalid company size"),
    body("foundedYear")
      .optional()
      .isInt({ min: 1800, max: new Date().getFullYear() })
      .withMessage("Please provide a valid founding year"),
    body("contactInfo.email").optional().isEmail().withMessage("Please provide a valid contact email"),
  ],
  validateRequest,
  updateCompany
);

export default router;
