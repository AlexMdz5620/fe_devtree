import { Link } from "react-router-dom"

function LoginView() {
    return (
        <>
            <div>LoginView</div>
            <nav>
                <Link to='/auth/register'>
                    ¿No tienes cuenta? Crea una
                </Link>
            </nav>
        </>
    )
}

export default LoginView