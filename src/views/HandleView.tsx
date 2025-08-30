import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom"
import { getUserByHandle } from "../api/DevTreeApi";
import HandleData from "../components/HandleData";
import { Toaster } from 'sonner';
import Logo from '../components/Logo';

export default function HandleView() {
    const params = useParams();
    const handle = params.handle!;

    const { data, error, isLoading } = useQuery({
        queryKey: ['handle', handle],
        queryFn: () => getUserByHandle(handle),
        retry: 1
    });

    if (isLoading) return <p className="text-center text-white">Cargando...</p>
    if (error) return <Navigate to={'/404'} />
    if (data) return (
        <>
            <div className="bg-slate-800 min-h-screen">
                <div className="max-w-lg mx-auto pt-10 px-5">
                    <Logo />
                    <div className="py-10">
                        <HandleData data={data} />
                    </div>
                </div>
            </div>
            <Toaster position="top-right" />
        </>
    );
}
