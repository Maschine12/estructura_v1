export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-6xl font-bold ">404</h1>
            <p className="text-xl mt-4">Página no encontrada</p>
            <a href="/vigas" className="mt-6 text-blue-500 p-3 bg-green-500 rounded-xl text-white hover:scale-105 transition ">Volver al inicio</a>
        </div>
    );
}
