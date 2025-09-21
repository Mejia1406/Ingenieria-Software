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

interface Review {
  _id: string;
  user: { name: string; avatar: string };
  rating: number;
  date: string;
  text: string;
  likes: number;
  dislikes: number;
}

// Simulación de distribución de estrellas (puedes traerlo de tu API)
const ratingDistribution = [
  { star: 5, percent: 40 },
  { star: 4, percent: 30 },
  { star: 3, percent: 15 },
  { star: 2, percent: 5 },
  { star: 1, percent: 10 },
];

// Simulación de reviews (trae esto de tu API real)
const mockReviews: Review[] = [
  {
    _id: "1",
    user: {
      name: "Sarah M.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    rating: 5,
    date: "2 months ago",
    text:
      "My experience at Tech Innovators Inc. has been nothing short of exceptional. The company culture is vibrant and inclusive, fostering a collaborative environment where everyone's ideas are valued. I've had the opportunity to work on challenging projects that have significantly contributed to my professional growth. The management team is supportive and genuinely cares about employee well-being, offering ample resources for personal and career development. I highly recommend Tech Innovators Inc. to anyone seeking a rewarding and fulfilling career in the tech industry.",
    likes: 25,
    dislikes: 5,
  },
  {
    _id: "2",
    user: {
      name: "David L.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    rating: 4,
    date: "3 months ago",
    text:
      "Tech Innovators Inc. is a solid company with a lot to offer. The work-life balance is commendable, and the benefits package is competitive. I appreciate the emphasis on innovation and the chance to work with cutting-edge technologies. While there are areas for improvement, such as internal communication, the overall experience has been positive. I've learned a great deal and feel valued as an employee.",
    likes: 18,
    dislikes: 3,
  },
  {
    _id: "3",
    user: {
      name: "Emily R.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    rating: 3,
    date: "4 months ago",
    text:
      "My time at Tech Innovators Inc. was a mixed bag. While I appreciated the opportunity to work on interesting projects, I found the company culture to be somewhat lacking. There were instances of micromanagement and a lack of transparency from upper management. The work-life balance was decent, but the overall atmosphere could be stressful at times. I believe Tech Innovators Inc. has potential, but needs to address some key issues to improve the employee experience.",
    likes: 12,
    dislikes: 7,
  },
];

const CompanyDetail: React.FC = () => {
  const { companyId } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

useEffect(() => {
  fetch(`http://localhost:5000/api/companies/${companyId}`)
    .then(res => res.json())
    .then(data => {
      console.log("Respuesta API:", data); // 👈 aquí confirmas estructura
      setCompany(data.data.company);
    });
  setReviews(mockReviews);
}, [companyId]);


  if (!company) {
    return <div className="p-10">Cargando empresa...</div>;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 px-10 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="size-4">
                {/* Icono igual al de Companies */}
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">TalentTrace</h2>
            </div>
            <div className="flex items-center gap-9">
              <Link
                className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
                to="/"
              >
                Inicio
              </Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Reseñas</a>
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/companies">Empresas</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Experiencias</a>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            {/* Aquí puedes agregar el buscador y el avatar si lo necesitas */}
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between p-4">
              <div className="flex gap-4 items-center">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg min-h-32 w-32"
                  style={{ backgroundImage: `url("${company.coverImagen || company.logo || ""}")` }}
                ></div>
                <div className="flex flex-col gap-1">
                  <p className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em]">{company.name}</p>
                  <p className="text-[#49739c] text-base font-normal leading-normal">
                    {company.industry}
                    {company.size && ` | ${company.size} empleados`}
                    {company.founded && ` | Fundada ${company.founded}`}
                  </p>
                  {(company.headquarters?.city || company.headquarters?.country) && (
                    <p className="text-[#49739c] text-base font-normal leading-normal">
                      {company.headquarters?.city}{company.headquarters?.city && company.headquarters?.country ? ', ' : ''}{company.headquarters?.country}
                    </p>
                  )}
                </div>
              </div>
              <button
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em] w-full max-w-[120px] md:w-auto"
              >
                <span className="truncate">Follow</span>
              </button>
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
              {/* Overrating y barras */}
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
              <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
                {ratingDistribution.map((item) => (
                  <React.Fragment key={item.star}>
                    <p className="text-[#0d141c] text-sm font-normal leading-normal">{item.star}</p>
                    <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#cedbe8]">
                      <div className="rounded-full bg-[#0d80f2]" style={{ width: `${item.percent}%` }}></div>
                    </div>
                    <p className="text-[#49739c] text-sm font-normal leading-normal text-right">{item.percent}%</p>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Reviews */}
            <div className="flex flex-col gap-8 overflow-x-hidden bg-slate-50 p-4">
              {reviews.map((review) => (
                <div key={review._id} className="flex flex-col gap-3 bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                      style={{ backgroundImage: `url("${review.user.avatar}")` }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-[#0d141c] text-base font-medium leading-normal">{review.user.name}</p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={i < review.rating ? "text-[#0d80f2]" : "text-[#acc2d8]"}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                        </svg>
                      </div>
                    ))}
                  </div>
                  <p className="text-[#0d141c] text-base font-normal leading-normal">{review.text}</p>
                  <div className="flex gap-9 text-[#49739c]">
                    <button className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path>
                      </svg>
                      <p>{review.likes}</p>
                    </button>
                    <button className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"></path>
                      </svg>
                      <p>{review.dislikes}</p>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Paginación simple */}
            <div className="flex items-center justify-center p-4">
              <a href="#" className="flex size-10 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                </svg>
              </a>
              <a className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-[#0d141c] rounded-full bg-[#e7edf4]" href="#">1</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#0d141c] rounded-full" href="#">2</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#0d141c] rounded-full" href="#">3</a>
              <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#0d141c] rounded-full" >...</span>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-[#0d141c] rounded-full" href="#">10</a>
              <a href="#" className="flex size-10 items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;