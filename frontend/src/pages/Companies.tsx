import React, { useState } from "react";

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
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">TalentTrace</h2>
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