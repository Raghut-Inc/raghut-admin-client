import NavBar from "../components/NavBar";

const Landing = ({ user, setUser }) => {
  return (
    <>
      <NavBar user={user} setUser={setUser} animate={true} />
      <div
        style={{ minHeight: "calc(100svh - 7rem)" }}
        className="w-full h-full flex justify-center items-center flex-col p-4 md:p-6 relative"
      >
        <div className="max-w-screen-xl w-full h-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:space-x-12 py-12">
            <div className="">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-4xl space-y-2">
                <span className="block">Under maintenance</span>
                <span className="block text-indigo-600">We'll be right back.</span>
              </h1>
              <h2 className="mt-3 max-w-md text-xs text-gray-500 sm:text-sm md:mt-5 md:max-w-3xl">
                AI HARDWARE. RESTAURANTS. VOICE ORDER
              </h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
