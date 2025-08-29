import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Company {
  industry: string;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  size: string;
}

const companiesData: Company[] = [
  {
    industry: "Technology",
    name: "Tech Innovators Inc.",
    rating: 4.5,
    reviews: 1200,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAO81K945vo1JQhF5bJ9O6C33gg8knGrIz8RyMxZ811j5Rm6C2paIVn6oAarrcF4PBZXufnsxIANL7HaQz_NFMgT1u3kY3ZdcjqMMirr3ncaWSRcAYbKbguqzi67RgJxlteVJT5pp9CLIWemt7iL4VY6yVsaF1Cv639P_qKNmok_wCSioSa_5_eTXhqYKcrEm7xMdo7V82nShYZLU9A6M7_1JQKNKgGlxc8LJIvpvxi71zIoBM-t3VHCnnLhb5QMMHOZanfCvdBfhY",
    location: "New York",
    size: "1000+",
  },
  {
    industry: "Finance",
    name: "Global Finance Group",
    rating: 4.2,
    reviews: 850,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdkz7Tgz-llb0sqgEtao_EQEbmG7nT8KHgthZMjQ8_HxBwtI8uycVSVmwR1rxcJLOX5YCAotF5vfeK2WxlMBES2C5dSUr3MP_0dBnBg2Ie5X0yqdd3xi1IFUCuARE5a5V_QlVEPoA8S416wvDwHGimH2KgRG4yvrTpxm5DXC2xroW2nJZh9ota7xwVzfZjioMX4p41RVvk1zmiA7k2q2GhlE51oV5mqj6rMmCQDMa_bJNoCHhXqy7CChostUoDeDyQlQm_g7xMmDs",
    location: "London",
    size: "500-999",
  },
  {
    industry: "Healthcare",
    name: "Health Solutions Corp.",
    rating: 4.0,
    reviews: 600,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBzIP3faEkcGClhd3PxkFnymxq0K9KbpTIeMb_5FL4suoN5ASb3s3Hrk1dPZcZVbgw8u2kP_wXRvceaiVNsh6PFEKtTGIreRy9Bo3YHYT1CE5riea4wbwf5L4FM3xZbYjqobYbjZsqPKrBk8h1BkxTX9zutfeKs4T0l0DE11yCuCWwN7jNP_andnBN8bW1NU29r6NN1H-mzWEqlVD0R4gkZLc749QwV-839rMIs62QCb9qpm8GEjwaObx1YjzORoCm2fZYiafezog4",
    location: "Madrid",
    size: "200-499",
  },
  {
    industry: "Retail",
    name: "Retail Empire Ltd.",
    rating: 3.8,
    reviews: 450,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBtiGNJQMNaA_TIpztX-jbafUycLFmRRfTjpJoMLxnEYDlTM6Dlcp7GxXcWanM-TFNx-W6cAaJM35QTIeWluSAWZguO_mDql5xl_6YngxH_5mfz-vcVUKbNvLTNzTl06EKZJli8Izcpxqfqros3xLRmHSJ0Gg1BF2GCavNPRJjLYLD2Hwe_efkzJOBD5JHDjXVPmbPJj2N0vEDHFrPH5qv6IFsqwkLwLl0r4gAtUsRZY7qRRK8kyVWRY2E8lDdYFpwOK6Se1U4tKxw",
    location: "Berlin",
    size: "50-199",
  },
  {
    industry: "Consulting",
    name: "Strategic Advisors LLC",
    rating: 4.3,
    reviews: 700,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFve09p18Y5r2t-11TH8q3IiyK9Jr6dwN8-d49Sn-89avnENDF-KuEYdxaGlFufdG-tBNb9u5LRwOsYzMdVzBnSkEqZftnjU7h6QVsBK_DVk6ZT9gYqRJ1_CNSovOJjdBUUQQqF3U7sxOsIiT4N4iobO-FxhD_qA9LiWufQDpAJ4JDN0DoQJ2IC6u_9egB_bvWAnTaooW6Vzh_768m6l0v9bzMf_pRorVlD26qP8YNVA0-OLgdJN9Nl4wtJfmiYeSXDzsvBKLeNIo",
    location: "Paris",
    size: "1-49",
  },
];

const industries = ["All", ...Array.from(new Set(companiesData.map(c => c.industry)))];
const locations = ["All", ...Array.from(new Set(companiesData.map(c => c.location)))];
const sizes = ["All", ...Array.from(new Set(companiesData.map(c => c.size)))];

const Companies: React.FC = () => {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [location, setLocation] = useState("All");
  const [size, setSize] = useState("All");

  const filteredCompanies = companiesData.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industry === "All" || company.industry === industry;
    const matchesLocation = location === "All" || company.location === location;
    const matchesSize = size === "All" || company.size === size;
    return matchesSearch && matchesIndustry && matchesLocation && matchesSize;
  });

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 px-10 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-slate-900">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z" fill="currentColor" />
                </svg>
              </div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">TalentTrace</h2>
            </div>
            <div className="flex items-center gap-9">
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/">Home</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Reviews</a>
              <Link className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" to="/companies">Companies</Link>
              <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Experiences</a>
            </div>
          </div>
          <div className="flex flex-1 justify-end gap-8">
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Search bar */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#49739c] flex border-none bg-[#e7edf4] items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                    </svg>
                  </div>
                  <input
                    placeholder="Search companies"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-full placeholder:text-[#49739c] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </label>
            </div>
            {/* Filtros */}
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              {/* Industry filter */}
              <select
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e7edf4] pl-4 pr-2 text-[#0d141c] text-sm font-medium leading-normal"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              {/* Location filter */}
              <select
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e7edf4] pl-4 pr-2 text-[#0d141c] text-sm font-medium leading-normal"
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {/* Size filter */}
              <select
                className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e7edf4] pl-4 pr-2 text-[#0d141c] text-sm font-medium leading-normal"
                value={size}
                onChange={e => setSize(e.target.value)}
              >
                {sizes.map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Companies</h2>
            {/* Lista de empresas */}
            {filteredCompanies.length === 0 && (
              <div className="p-4 text-center text-[#49739c]">No companies found.</div>
            )}
            {filteredCompanies.map(company => (
              <div className="p-4" key={company.name}>
                <div className="flex items-stretch justify-between gap-4 rounded-lg">
                  <div className="flex flex-col gap-1 flex-[2_2_0px]">
                    <p className="text-[#49739c] text-sm font-normal leading-normal">{company.industry}</p>
                    <p className="text-[#0d141c] text-base font-bold leading-tight">{company.name}</p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">
                      Average Rating: {company.rating} · {company.reviews} reviews
                    </p>
                  </div>
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                    style={{ backgroundImage: `url("${company.image}")` }}
                  ></div>
                </div>
              </div>
            ))}
            {/* Paginación (puedes implementar si lo necesitas) */}
            <div className="flex items-center justify-center p-4">
              {/* ...paginación... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Companies;