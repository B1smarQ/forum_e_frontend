import {Link, useNavigate} from "react-router-dom";

export default function Header(){
    const navigate = useNavigate();
    return (
        <>
            <div className={"flex justify-between items-center bg-gray-700 p-2"}>
                <div>
                    <Link to = "/" className={"text-4xl font-bold text-white ml-24 mr-4"}>
                        E
                    </Link>
                    <Link to = "/" className={"text-2xl font-bold text-white ml-4"}>
                        Home
                    </Link>
                </div>
                <div className={"flex justify-between items-center bg-gray-700 p-6"}>
                    <button className={"text-2xl font-bold text-white ml-4 mr-4 bg-blue-700 p-2 rounded-lg hover:bg-blue-800 cursor-pointer transition duration-150 ease-in"} onClick={()=>navigate("/")}>
                        Create post
                    </button>
                    <div className={"flex justify-between items-center bg-gray-700 p-1"}>
                        <p className={"text-2xl font-bold text-white ml-4 mr-2 "}>
                            !!USERNAME!!
                        </p>
                        <Link to = "/profile/user">
                            <img src={"lorem_pfp.jpg"} alt={"userName"} className={"rounded-full h-[40px] w-[40px]"} />
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}