import React from 'react';

const HomePage: React.FC = () => {
    return (
        <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <div className="layout-container flex h-full grow flex-col">
                {/* Header */}
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
                            <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Home</a>
                            <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Reviews</a>
                            <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Salaries</a>
                            <a className="text-slate-900 text-sm font-medium leading-normal hover:text-blue-600 transition-colors cursor-pointer" href="#">Jobs</a>
                        </div>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <label className="flex flex-col min-w-40 !h-10 max-w-64">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                <div className="text-slate-500 flex border-none bg-slate-100 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                                    </svg>
                                </div>
                                <input
                                    placeholder="Search"
                                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-0 border-none bg-slate-100 focus:border-none h-full placeholder:text-slate-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                />
                            </div>
                        </label>
                        <div className="flex gap-2">
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors">
                                <span className="truncate">Sign In</span>
                            </button>
                            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-slate-200 transition-colors">
                                <span className="truncate">Write a Review</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="px-10 lg:px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        {/* Hero Section */}
                        <div className="container mx-auto">
                            <div className="p-4">
                                <div
                                    className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-lg items-center justify-center p-8"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1626&q=80")`
                                    }}
                                >
                                    <div className="flex flex-col gap-2 text-center">
                                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                                            Find the right company for you
                                        </h1>
                                        <h2 className="text-white text-sm md:text-base font-normal leading-normal">
                                            Explore company reviews, salaries, and interview insights from employees and candidates.
                                        </h2>
                                    </div>
                                    <label className="flex flex-col min-w-40 h-14 w-full max-w-[480px] md:h-16">
                                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                            <div className="text-slate-500 flex border border-slate-300 bg-white items-center justify-center pl-[15px] rounded-l-lg border-r-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                                                </svg>
                                            </div>
                                            <input
                                                placeholder="Search for a company"
                                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-slate-900 focus:outline-0 focus:ring-0 border border-slate-300 bg-white focus:border-slate-400 h-full placeholder:text-slate-500 px-[15px] border-r-0 border-l-0 text-sm md:text-base font-normal leading-normal"
                                            />
                                            <div className="flex items-center justify-center rounded-r-lg border-l-0 border border-slate-300 bg-white pr-[7px]">
                                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 md:h-12 px-4 md:px-5 bg-blue-600 text-white text-sm md:text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors">
                                                    <span className="truncate">Search</span>
                                                </button>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Featured Companies */}
                        <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Companies</h2>
                        <div className="flex overflow-x-auto pb-4">
                            <div className="flex items-stretch p-4 gap-3 min-w-max">
                                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")' }}
                                    />
                                    <div>
                                        <p className="text-slate-900 text-base font-medium leading-normal">Tech Innovators Inc.</p>
                                        <p className="text-slate-500 text-sm font-normal leading-normal">Leading the way in software development and innovation.</p>
                                    </div>
                                </div>
                                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")' }}
                                    />
                                    <div>
                                        <p className="text-slate-900 text-base font-medium leading-normal">Global Solutions Corp.</p>
                                        <p className="text-slate-500 text-sm font-normal leading-normal">Providing cutting-edge solutions to global challenges.</p>
                                    </div>
                                </div>
                                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-60">
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg flex flex-col"
                                        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80")' }}
                                    />
                                    <div>
                                        <p className="text-slate-900 text-base font-medium leading-normal">Creative Minds Studio</p>
                                        <p className="text-slate-500 text-sm font-normal leading-normal">Fostering creativity and collaboration in a dynamic environment.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Success Stories */}
                        <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Success Stories</h2>
                        <div className="p-4">
                            <div className="flex flex-col lg:flex-row items-stretch justify-start rounded-lg gap-4">
                                <div
                                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg min-h-[200px]"
                                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}
                                />
                                <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-3 py-4 lg:px-4">
                                    <p className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em]">From Candidate to Team Lead</p>
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
                                        <p className="text-slate-500 text-base font-normal leading-normal">
                                            Read how Sarah's journey from a candidate to a team lead at Tech Innovators Inc. was shaped by insights from our platform.
                                        </p>
                                        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-blue-600 text-white text-sm font-medium leading-normal hover:bg-blue-700 transition-colors">
                                            <span className="truncate">Read Story</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Get Started */}
                        <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Get Started</h2>
                        <div className="flex justify-center">
                            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1 hover:bg-blue-700 transition-colors">
                                    <span className="truncate">Sign Up as Candidate</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-slate-100 text-slate-900 text-sm font-bold leading-normal tracking-[0.015em] flex-1 hover:bg-slate-200 transition-colors">
                                    <span className="truncate">Sign Up as Recruiter</span>
                                </button>
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline cursor-pointer hover:text-slate-700 transition-colors">
                            Already have an account? Sign In
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;