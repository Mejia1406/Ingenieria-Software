import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  size: string;
  overallRating: number;
  totalReviews: number;
  headquarters?: { city: string; country: string };
  coverImagen?: string;
  logo?: string;
  founded?: string;
  location?: string;
}

const CompanyDetail: React.FC = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    // Aquí deberías hacer una petición a tu backend para traer la empresa por slug o id
    // Ejemplo con fetch:
    fetch(`/api/companies/${companyId}`)
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(() => setCompany(null));
  }, [companyId]);

  if (!company) {
    return <div className="p-10">Cargando empresa...</div>;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">TalentHub</h2>
            </div>
            <div className="flex items-center gap-9">
              <Link className="text-[#0d141c] text-sm font-medium leading-normal" to="/">Home</Link>
              <Link className="text-[#0d141c] text-sm font-medium leading-normal" to="/companies">Companies</Link>
              <a className="text-[#0d141c] text-sm font-medium leading-normal" href="#">Salaries</a>
              <a className="text-[#0d141c] text-sm font-medium leading-normal" href="#">Interviews</a>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            {/* Aquí puedes agregar el buscador y el avatar si lo necesitas */}
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex p-4">
              <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
                <div className="flex gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg min-h-32 w-32"
                    style={{ backgroundImage: `url("${company.coverImagen || company.logo || ""}")` }}
                  ></div>
                  <div className="flex flex-col">
                    <p className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em]">{company.name}</p>
                    <p className="text-[#49739c] text-base font-normal leading-normal">
                      {company.industry} | {company.size} empleados {company.founded && `| Fundada ${company.founded}`}
                    </p>
                    <p className="text-[#49739c] text-base font-normal leading-normal">
                      {company.headquarters?.city}, {company.headquarters?.country}
                    </p>
                  </div>
                </div>
                <button
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[480px] md:w-auto"
                >
                  <span className="truncate">Follow</span>
                </button>
              </div>
            </div>
            <div className="pb-3">
              <div className="flex border-b border-[#cedbe8] px-4 gap-8">
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49739c] pb-[13px] pt-4" href="#">
                  <p className="text-[#49739c] text-sm font-bold leading-normal tracking-[0.015em]">Experiences</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-[#0d80f2] text-[#0d141c] pb-[13px] pt-4" href="#">
                  <p className="text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">Reviews</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49739c] pb-[13px] pt-4" href="#">
                  <p className="text-[#49739c] text-sm font-bold leading-normal tracking-[0.015em]">FAQs</p>
                </a>
                <a className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#49739c] pb-[13px] pt-4" href="#">
                  <p className="text-[#49739c] text-sm font-bold leading-normal tracking-[0.015em]">About</p>
                </a>
              </div>
            </div>
            {/* Aquí puedes agregar reviews, gráficos, etc. */}
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Reviews</h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">{company.overallRating}</p>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={i < Math.round(company.overallRating) ? "text-[#0d80f2]" : "text-[#cedbe8]"}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                      </svg>
                    </div>
                  ))}
                </div>
                <p className="text-[#0d141c] text-base font-normal leading-normal">{company.totalReviews} reviews</p>
              </div>
              {/* Aquí puedes agregar más detalles, gráficos, etc. */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;