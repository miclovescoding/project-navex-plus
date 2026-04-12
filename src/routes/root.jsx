import { Link, Outlet } from "react-router-dom";
{/*Link changes page without reloading, Outlet inserts child pages (Eg. MainPage)*/}

export default function Root() {
  return (
    <div className="flex min-h-screen flex-col bg-[#292929] font-mono text-white">
      <div className="flex-grow py-8">
        <h1 className="mb-4 text-center font-['Major_Mono_Display'] text-4xl text-[#6da48d]">
          <Link to={"/"}>Project Navex Plus</Link>
        </h1>
        <p className="text-center text-lg text-gray-300 tracking-wide">
      Plan fast. Move faster.
      </p>
      {/* <p className="text-center text-sm text-gray-400">
      Your NDS, minus the headache.
      </p> */}
      <p className="mb-5 text-center"></p>
      <p className="mb-5 text-center">Generate your NDS with a few clicks!</p>
        


        <Outlet /> {/* where child page is inserted */}
      </div>
      <footer className="bg-black pb-10 pt-6 text-center">
        <h2 className="m-4 text-xl font-bold">Dari Kiri, Cepat Jalan!</h2>
        {/* <p className="mb-2 text-center">ORD Lo.</p> */}
        <p className="text-xs">
          <a href="https://github.com/miclovescoding">Michael</a> |{" "} {/* developer links */}
          {/* <a href="https://github.com/wuihee">Wuihee</a> |{" "} */}
          <a href="mailto: navexplus@gmail.com">Contact</a> | <Link></Link>
          <Link to={"/donate"}>Support Us</Link>               
          {/* donate page link
           To update footer in the future */}
        </p>
      </footer>
    </div>
  );
}
