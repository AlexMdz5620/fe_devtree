import type { ReactNode } from "react";

type ErrorMessProps = { children: ReactNode }

export default function ErrorMess({ children }: ErrorMessProps) {
    return (
        <p className="bg-red-50 text-red-600 p-3 uppercase text-sm font-bold text-center">{children}</p>
    )
}
