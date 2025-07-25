import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import ErrorMess from "../components/ErrorMess";
import type { LoginForm } from "../types";
import api from "../config/axios";
import { toast } from "sonner";
import { isAxiosError } from "axios";

function LoginView() {
    const initialValues: LoginForm = {
        email: '',
        password: '',
    }
    const { register, formState: { errors }, handleSubmit } = useForm({ defaultValues: initialValues });
    const navigate = useNavigate();

    const handleLogin = async (formData: LoginForm) => {
        try {
            const { data } = await api.post(`/auth/login`, formData);
            localStorage.setItem('AUTH_TOKEN', data);
            navigate('/admin');
        } catch (error) {
            if (isAxiosError(error)) {
                toast.error(error.response?.data.error);
            }
        }
    }

    return (
        <>
            <h1 className="text-4xl text-white font-bold">Iniciar Sesión</h1>
            <form
                onSubmit={handleSubmit(handleLogin)}
                className="bg-white px-5 py-6 rounded-lg space-y-6 mt-10"
                noValidate
            >
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="email" className="text-2xl text-slate-500">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Email de Registro"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("email", {
                            required: "El Email es obligatorio",
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "E-mail no válido",
                            },
                        })}
                    />
                    {errors.email && (
                        <ErrorMess>{errors.email.message}</ErrorMess>
                    )}
                </div>
                <div className="grid grid-cols-1 space-y-3">
                    <label htmlFor="password" className="text-2xl text-slate-500">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password de Registro"
                        className="bg-slate-100 border-none p-3 rounded-lg placeholder-slate-400"
                        {...register("password", {
                            required: "El Password es obligatorio",
                        })}
                    />
                    {errors.password && (
                        <ErrorMess>{errors.password.message}</ErrorMess>
                    )}
                </div>

                <input
                    type="submit"
                    className="bg-cyan-400 p-3 text-lg w-full uppercase text-slate-600 rounded-lg font-bold cursor-pointer"
                    value='Iniciar Sesión'
                />
            </form>
            <nav className="mt-10">
                <Link
                    to='/auth/register'
                    className="text-center text-white text-lg block"
                >
                    ¿No tienes cuenta? Crea una
                </Link>
            </nav>
        </>
    )
}

export default LoginView